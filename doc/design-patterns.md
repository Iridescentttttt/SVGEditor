# 设计模式与对应代码

本文说明每种设计模式用在什么变化上，以及对应类是按什么顺序写出来的。项目介绍、运行方式和课程要求的其余回答在仓库根目录的 [README.md](../README.md)。

模式只加在已经出现的变化上。图形类型还会增加，所以不用访问者；现在只有命令行一个同步入口，所以不用观察者。

| 模式 | 解决的变化 | 主要类型 |
|---|---|---|
| 命令 Command | 同一动作要撤销、重做，或从命令行以外的入口触发 | `Command`、`CommandHistory`、`MoveCommand` |
| 组合 Composite | 容器和叶子都要 `move` / `scale` / `delete` | `Shape`、`GroupShape` |
| 适配器 Adapter | XML 库和磁盘的接口不是我们的 | `XmlSvgCodec`、`NodeTextFiles` |
| 工厂方法 Factory Method | 按类型名或标签构造图形，内核不写分支 | `ShapeProvider`、`ShapeRegistry` |
| 策略 Strategy | 命令成功后，历史栈有四种不同效果 | `HistoryPolicy` |
| 模板方法 Template Method | 几种叶子的属性校验、赋值、快照步骤相同 | `PaintedShape` |
| 迭代器 Iterator | 按文档前序遍历，分组不看参数书写顺序 | `ShapeIterator` |
| 备忘录 Memento | 撤销要恢复执行前的状态，又不能整份复制文档 | `ShapeMemento` |
| 外观 Facade | 终端只提交一行文本 | `CliController` |

---

## 命令

一次用户操作要能先被创建、以后再执行，还要能撤销。如果把「怎么移动」写在按钮或命令类里，换一个入口就要再写一遍，撤销也没有地方放执行前的状态。

编写时先定五个角色，再写具体命令。客户端只装配，调用者只调度，接收者才改数据。

| 角色 | 类 | 写的时候守住的边界 |
|---|---|---|
| 客户端 | `Main`、`CommandBindings` | 只负责 `new` 和登记命令名 |
| 调用者 | `CommandHistory` | 只负责两栈和锁定，不认识矩形或圆 |
| 命令 | `Command`、`UndoableCommand` | 声明 `execute`；能撤销的再声明 `undo` |
| 具体命令 | `MoveCommand` 等，一类一文件 | 解析自己的 token，调用接收者，留下逆操作 |
| 接收者 | `Document`、`Shape` | 知道这一步怎么改树、怎么改坐标 |

`CommandBindings` 把命令名对到 `MoveCommand.parse`。`parse` 只检查 token 个数并把数字解析出来，不改文档。真正执行发生在历史栈调用 `execute` 的时候：

```typescript
execute(): readonly string[] {
  this.edit = this.workspace.requireDocument().move(this.id, this.dx, this.dy);
  return this.edit.getLines();
}

undo(): readonly string[] {
  if (this.edit === null) throw new Error("undo before execute");
  return this.edit.undo();
}
```

接收者这边的 `Document.move` 才拍快照、改坐标、生成回显。命令看不见 `cx` 和 `cy`：

```typescript
move(id: string, dx: number, dy: number): EditResult {
  const shape = this.requireShape(id);
  const checkpoint = shape.checkpoint();
  const back = shape.movedBackText(dx, dy);
  shape.move(dx, dy);
  return new EditResult(
    [shape.movedText(dx, dy)],
    new SnapshotRestore(() => {
      checkpoint.restore();
    }, [back]),
  );
}
```

历史栈把「做完了没有」和「要不要入栈」拆开。`execute` 若抛出 `EditorError`，下面的 `apply` 不会运行，失败的命令不会入栈：

```typescript
execute(command: Command): readonly string[] {
  const lines = command.execute();
  command.historyPolicy().apply(this, command);
  return lines;
}
```

`redo` 再次调用同一条命令的 `execute()`，不是把上次打印过的字符串拿出来。所以 `CreateCommand.execute` 必须在撤销、id 已经释放之后，还能再创建同一个 id。

四种入栈效果不写在这个方法里，交给下一节的策略。编辑命令入 undo 栈并清空 redo 栈；`init` / `read` 清空两栈并锁定；`save` 和修改画布尺寸只锁定、保留 undo 栈；`tree` / `show` / `help` 不碰栈。锁定期间 `undo` 和 `redo` 都报 `error: undo not allowed after io command`。下一次成功的编辑才开锁。

`undo` 和 `redo` 写成 `CommandHistory` 的方法，由 `CliController` 在分派时直接调用。它们不是再压进栈里的命令，否则「撤销」自己也会变成一条可撤销记录。

用户不能 `ungroup` 顶层容器。撤销 `group` 不调用 `ungroup`。`Document.group` 在改树之前记下每个成员原来的父容器和顺序，命令只保存这份逆操作。否则把两个顶层图形收成一组之后，撤销会被顶层禁令拦住。

---

## 组合

`move c1 30 0` 和 `move hall 0 24` 是同一条 `MoveCommand`。容器和叶子必须接受同一种操作，命令里不能出现「如果是组就递归」。

先写抽象的 `Shape`，声明 `move`、`scale`、`setAttribute`。叶子各自改字段。`GroupShape` 同时是 `Shape` 和 `ShapeContainer`，操作只转给直接子节点：

```typescript
override move(dx: number, dy: number): void {
  for (const child of this.items) {
    child.move(dx, dy);
  }
}

override scale(factor: number): void {
  for (const child of this.items) {
    child.scale(factor);
  }
}
```

子组收到 `scale` 之后再转给它自己的子节点，所以每个叶子只乘一次。外层组和内层组如果各乘一遍叶子，`scale outer 2` 会把坐标乘成 4 倍。子列表是私有数组，外部只能通过 `insert` / `remove` 改，父子指针也只在这两处更新。

`SvgRoot` 实现 `ShapeContainer`，但不是 `Shape`。它没有 id，不能被 `move` 或 `delete`。画布宽高只由 `init`、`read`、`canvas` 修改。这样统一操作不必为根节点再写特例。

`front` 把图形插到同级列表末尾，`back` 插到开头。写出 SVG 时按这个顺序，后出现的兄弟画在上层。

---

## 适配器

领域要的是「一段 SVG 文本」和「按路径读写字符串」。`@xmldom/xmldom` 给出 DOM 节点，`node:fs` 抛的是系统错误。若让 `ReadCommand` 直接使用这两样，命令和文档就绑死在库上，测试也必须准备真实文件。

先在领域和会话里写目标接口，再在 `io` 里写适配器。`Main` 创建适配器并注入命令，命令的构造参数类型是接口。

| | XML | 文件系统 |
|---|---|---|
| 目标接口 | `SvgTextCodec` | `TextFiles` |
| 被适配者 | `DOMParser` | `node:fs` |
| 适配器 | `XmlSvgCodec` | `NodeTextFiles` |

`parse` 走完 DOM，只把 `RawElement` 交出去。标签、属性、文本和有序子元素够装载器用，库的节点类型不出这个类：

```typescript
parse(text: string): RawElement {
  const errors: string[] = [];
  const parser = new DOMParser({
    onError: (level, message) => {
      if (level !== "warning") errors.push(message);
    },
  });
  const xml = parser.parseFromString(text, "image/svg+xml");
  // 失败时抛 EditorError；成功时把 DOM 收成 RawElement
}
```

`format` 不交给 XML 库写。属性顺序是编辑器自己的契约，由 `SvgSerializer` 按 `id`、几何、已设置的外观这个顺序生成。

缺 id 时，`SvgLoader` 按「标签名 + 序号」分配并警告。`transform` 等未知属性警告后丢弃，不改几何。`move` 已经直接改坐标，再把 `translate` 烘焙进去会移两次。

测试里的 `MemoryTextFiles` 实现同一个 `TextFiles`。读不到路径就抛普通错误，`ReadCommand` 把它收成 `error: cannot read file`。生产环境换成 `NodeTextFiles`，命令类不用改。

---

## 工厂方法

`create rect` 和 `create circle` 的参数个数、字段名都不同。若写在 `CreateCommand` 里，每加一种图形都要改这条命令，读 SVG 时还要再写一套同样的分支。

把「怎么构造」放到类型自己身上。`ShapeProvider` 的工厂方法是：

```text
create(id, args) → Shape          命令行参数
read(id, raw, children) → ReadPiece   已经解析好的中性元素
matches(raw) → boolean            这个标签归不归我
```

`RectShapeProvider.create` 检查参数是 4 个或 5 个，解析 x、y、宽、高和可选的 fill，然后 `new RectShape`。圆、椭圆、线、文字、组各写一个提供者，一类一文件。

登记只发生在 `ShapeBindings.registerBuiltins`。这是按类型名分派的唯一位置，文件头标了待重构。`ShapeRegistry` 自己开始是空表：

```typescript
byName(typeName: string): ShapeProvider | null { /* 按登记顺序找类型名 */ }

match(raw: RawElement): ShapeProvider | null {
  for (let index = this.providers.length - 1; index >= 0; index -= 1) {
    if (this.providers[index].matches(raw)) return this.providers[index];
  }
  return null;
}
```

`CreateCommand` 用 `byName`。名字不存在就报 `error: unknown shape type: box (is the plugin loaded?)`，所以本阶段不实现 `box` 也不会在命令里写死这个字符串的特殊情况。`SvgLoader` 用 `match`，并且从后往前找。插件在内置 `g` 之后登记时，可以先匹配 `data-kind="box"`；没装插件时，内置 `g` 仍接收这种元素，读回来降级成普通组。

---

## 策略

命令成功之后，历史栈不是都入栈。查询不动，编辑入栈并清空重做栈，换文档清空两栈并锁定，保存只锁定、留下原来的撤销栈。`canvas` 还要看有没有参数：只查询尺寸时不能锁栈，改尺寸时要锁。

这些效果如果写成 `CommandHistory` 里的字符串分支，每加一种效果都要改调用者，`canvas` 的两种情况也会混进历史栈。编写时先让历史栈实现 `HistoryLedger` 的三个动作：`recordEdit`、`recordReset`、`recordLock`。策略对象只决定调用哪一个：

```typescript
static readonly edit = new HistoryPolicy((ledger, command) => {
  ledger.recordEdit(command as UndoableCommand);
});
static readonly reset = new HistoryPolicy((ledger) => ledger.recordReset());
static readonly lock = new HistoryPolicy((ledger) => ledger.recordLock());
static readonly none = new HistoryPolicy(() => undefined);
```

具体命令在 `historyPolicy()` 里返回其中一个对象。`MoveCommand` 固定返回 `edit`。`CanvasCommand` 在解析阶段已经知道有没有宽高，所以选择写在命令上，而不是写在历史栈里：

```typescript
historyPolicy(): HistoryPolicy {
  return this.width === null ? HistoryPolicy.none : HistoryPolicy.lock;
}
```

`CommandHistory.execute` 成功后只调用 `policy.apply(this, command)`。撤销、重做、锁定判断仍然在历史栈里，策略不碰栈的内部数组。

---

## 模板方法

`set` 的规则在每种叶子上都一样：几何名要能解析成数，`fill` / `stroke` / `stroke-width` 走外观，其余报 `unknown attribute`。快照也是先记几何、再记外观。矩形、圆、椭圆、线各写一遍之后，文字还要再抄一遍，顺序一改就容易漏。

`PaintedShape` 把这个顺序写成模板。子类不能改步骤，只能实现三个抽象操作：有哪些几何名、怎么读一个数、怎么写一个数，外加怎么把这些数拍进闭包。文字多出来的 `text` 属性走可选的 `handlesExtra`，不另开一条外观路径。

```typescript
override setAttribute(name: string, value: string): void {
  if (this.geometryNames().includes(name)) {
    this.writeNumber(name, DecimalText.parse(value));
    return;
  }
  if (this.handlesExtra(name)) {
    this.writeExtra(name, value);
    return;
  }
  if (this.paint.handles(name)) {
    this.paint.set(name, value);
    return;
  }
  throw new EditorError(`error: unknown attribute: ${name}`);
}
```

`RectShape` 只填自己的字段。`validateAttribute` 和 `formatAssignment` 使用同一组名字，避免「能 set 的属性」和「能显示的属性」各写一张表：

```typescript
protected geometryNames(): readonly string[] {
  return ["x", "y", "width", "height"];
}

protected writeNumber(name: string, value: number): void {
  if (name === "x") this.x = value;
  else if (name === "y") this.y = value;
  else if (name === "width") this.width = value;
  else this.height = value;
}
```

`checkpoint` 在基类里按「几何闭包 → 额外字段闭包 → 外观闭包」的顺序恢复。组没有几何字段，不继承 `PaintedShape`。`GroupShape.setAttribute` 对任何名字都报未知属性。

---

## 迭代器

`group markers c1 box` 应保持 c1 和 box 在文档里的相对顺序，而不是命令行上谁写在前面。成员还可能来自不同父容器。若在 `Document.group` 里手写递归，前序规则会和树形显示各写一份。

`ShapeIterator` 只做前序，不判断图形类型。构造时把根的子节点逆序压栈；`next` 弹出一个，若它是容器，再把它的子节点逆序压栈。先得到这个节点，再得到它的子孙，同一层仍从左到右：

```typescript
next(): Shape {
  const shape = this.stack.pop();
  if (!shape) throw new Error("iterator exhausted");
  const nested = shape.asContainer();
  if (nested) {
    this.stack.push(...[...nested.children()].reverse());
  }
  return shape;
}
```

`Document` 里原来的私有递归改成 `new ShapeIterator(this.root).toArray()`。`group` 用这个数组筛出被点名的成员，新组插在序列中第一个成员原来的位置。迭代器不暴露容器内部的数组，调用方也不能在遍历时直接 `splice`。

---

## 备忘录

撤销要回到执行前的坐标和外观。在 `undo` 里对缩放再乘 `1/factor`，连续几次之后 `show` 里的数字对不回创建时的值。每次编辑都克隆整份文档，则 `save` 这种不改图形的命令也会复制整棵树。

编写时把「拍什么」放在图形上，把「何时恢复」放在命令上。叶子的 `captureNumbers` 把当前字段收进闭包。`PaintedShape.checkpoint` 再包上外观，交给 `ShapeMemento`。这个类只有 `restore`，没有读取 `x` 或 `fill` 的方法：

```typescript
export class ShapeMemento implements Restorable {
  constructor(private readonly apply: () => void) {}

  restore(): readonly string[] {
    this.apply();
    return [];
  }
}
```

组不保存自己的坐标。它先向每个子节点要一份备忘录，恢复时按当时的顺序调用。嵌套组因此只覆盖被这次 `move` 或 `scale` 碰到的子树：

```typescript
override checkpoint(): Restorable {
  const points = this.items.map((child) => child.checkpoint());
  return new ShapeMemento(() => {
    for (const point of points) {
      point.restore();
    }
  });
}
```

`Document.move` 在调用 `shape.move` 之前取备忘录，连同撤销文案放进 `EditResult`。`MoveCommand` 只保存这个 `EditResult`。删除和分组记下的是父容器与索引，也是命令持有的逆操作，只是拍的不是几何。

---

## 外观

终端循环如果直接创建命令、修改文档、捕获错误，提示符一改就要碰到业务。`Repl` 只做两件事：打印 `svg>`，把 `executeLine` 返回的每一行写出去。它依赖的类型是 `SessionController`，不引用 `MoveCommand` 或 `Document`。

`CliController` 实现这个接口。一行文本的路径写在一个方法里：

```typescript
executeLine(line: string): readonly string[] {
  try {
    const parsed = this.tokenizer.tokenize(line);
    if (parsed.isIgnorable()) return [];
    const action = this.bindings.dispatch(parsed.getTokens());
    if (action.isUndo()) return this.historyStep("undo");
    if (action.isRedo()) return this.historyStep("redo");
    return this.history.execute(action.getCommand());
  } catch (error) {
    if (error instanceof EditorError || error instanceof TokenError) return [error.message];
    throw error;
  }
}
```

空行和整行 `#` 注释在分词后结束。`undo` / `redo` 在这里转给历史栈。其余名字由 `CommandBindings` 变成命令对象，再进入 `CommandHistory`。`EditorError` 的消息里已经带 `error:`，外观只原样返回，不再包一层。

`Main` 是唯一的装配点：创建注册表、两个适配器、工作区和历史栈，把 `CliController` 注入 `Repl`。以后的图形界面可以构造同一个 `MoveCommand`，交给同一个 `CommandHistory`，接收者不用改。

---

## 没有采用的模式

| 模式 | 为什么这次不写 |
|---|---|
| 访问者 | 后面要加的是图形类型，操作集合相对固定。每加一种图形就要改序列化、树和属性上的全部 `visit`。遍历已经由组合和 `ShapeIterator` 完成 |
| 观察者 | 命令把文本同步返回给唯一的 REPL。没有第二组会增减的视图。界面出现之后，再让文档在变更后通知视图 |
| 装饰器 | `fill` 和 `stroke` 是属性，写在 `PaintStyle` 里。没有「给这一个对象临时加一层、还可以拆掉」的职责 |
| 单例 | `Workspace.getInstance()` 会让两个测试共享同一块画布。工作区、注册表和历史栈都由 `Main` 或测试自己创建后传进去 |
