import { describe, expect, it } from "vitest";
import { SessionHarness } from "../support/SessionHarness.js";

const otherSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="0" y="0" width="400" height="300" fill="#ffffff"/>
  <text id="t1" x="10" y="290">imported</text>
  <circle id="c1" cx="50" cy="50" r="10"/>
  <g id="g1">
    <rect id="r2" x="0" y="0" width="10" height="10"/>
    <circle id="c2" cx="5" cy="5" r="2"/>
  </g>
  <ellipse id="e1" cx="1" cy="2" rx="3" ry="4"/>
</svg>
`;

function runScript(session: SessionHarness, script: string): string[] {
  return script
    .split("\n")
    .flatMap((line) => [...session.run(line)]);
}

describe("SVG editor session", () => {
  it("plays the sample editing transcript", () => {
    const session = new SessionHarness();
    const lines = runScript(
      session,
      `
init 800 600
create rect bg 0 0 800 600 #ffffff
create text title 20 40 "My Diagram"
create circle c1 100 100 20 red
create rect box 200 80 60 60 #3366ff
group markers c1 box
tree
move c1 30 0
undo
redo
set title text "My Diagram v2"
undo
group bad c1 markers
delete box
undo
save demo.svg
undo
`,
    );
    expect(lines).toContain("canvas 800x600 created");
    expect(lines).toContain("g#markers created with 2 children");
    expect(lines.filter((line) => line === "circle#c1 moved to (130,100)")).toHaveLength(2);
    expect(lines.filter((line) => line === "circle#c1 moved back to (100,100)")).toHaveLength(1);
    expect(lines).toContain('text#title updated: text="My Diagram v2"');
    expect(lines).toContain('text#title updated: text="My Diagram"');
    expect(lines).toContain("error: cannot group a container into its own descendant: markers");
    expect(lines).toContain("rect#box deleted");
    expect(lines).toContain("rect#box restored into g#markers");
    expect(lines).toContain("saved to demo.svg (5 elements)");
    expect(lines).toContain("error: undo not allowed after io command");
    expect(lines).toContain("├── rect#bg  x=0 y=0 w=800 h=600 fill=#ffffff");
    expect(lines).toContain('├── text#title  (20,40) "My Diagram"');
    expect(lines).toContain("└── g#markers");
    expect(lines).toContain("    ├── circle#c1  cx=100 cy=100 r=20 fill=red");
    expect(lines).toContain("    └── rect#box  x=200 y=80 w=60 h=60 fill=#3366ff");
    expect(session.files.stored("demo.svg")).toContain("<svg");
  });

  it("builds a flowchart and moves a whole group once", () => {
    const session = new SessionHarness();
    runScript(
      session,
      `
init 800 600
create g flowchart
create g node1 in flowchart
create rect start 120 100 160 60 #4a90d9 in node1
create text start-label 155 135 "开始" in node1
create g node2 in flowchart
create rect process 520 100 160 60 #f5a623 in node2
create text process-label 545 135 "处理数据" in node2
create line arrow1 280 130 520 130 black in flowchart
`,
    );
    expect(session.run("move node2 0 100")).toEqual(["g#node2 moved by (0,100)"]);
    const moved = session.run("tree");
    expect(moved).toContain("    │   ├── rect#process  x=520 y=200 w=160 h=60 fill=#f5a623");
    expect(moved).toContain('    │   └── text#process-label  (545,235) "处理数据"');
    expect(session.run("undo")).toEqual(["g#node2 moved back by (0,-100)"]);
    expect(session.run("tree")).toContain("    │   ├── rect#process  x=520 y=100 w=160 h=60 fill=#f5a623");
    expect(session.run("show process")).toEqual([
      "rect#process  parent=g#node2",
      "  x=520 y=100 width=160 height=60",
      "  fill=#f5a623",
    ]);
  });

  it("reads an external svg, assigns missing ids, and round-trips", () => {
    const session = new SessionHarness();
    session.files.seed("other.svg", otherSvg);
    expect(session.run("read other.svg")).toEqual([
      "warning: assigned id rect1 to unnamed <rect>",
      "read other.svg (7 elements)",
    ]);
    expect(session.run("tree")).toEqual([
      "svg (400x300)",
      "├── rect#rect1  x=0 y=0 w=400 h=300 fill=#ffffff",
      '├── text#t1  (10,290) "imported"',
      "├── circle#c1  cx=50 cy=50 r=10",
      "├── g#g1",
      "│   ├── rect#r2  x=0 y=0 w=10 h=10",
      "│   └── circle#c2  cx=5 cy=5 r=2",
      "└── ellipse#e1  cx=1 cy=2 rx=3 ry=4",
    ]);
    session.run("save copy.svg");
    const copy = session.files.stored("copy.svg") ?? "";
    const again = new SessionHarness();
    again.files.seed("copy.svg", copy);
    again.run("read copy.svg");
    expect(again.run("tree")).toEqual(session.run("tree"));
  });

  it("drops transform without baking it into geometry", () => {
    const session = new SessionHarness();
    session.files.seed(
      "moved.svg",
      `<svg width="100" height="100"><g id="diagram" transform="translate(60,40)"><rect id="a" x="0" y="0" width="10" height="10"/></g></svg>`,
    );
    expect(session.run("read moved.svg")).toContain(
      "warning: ignored attribute transform on g",
    );
    expect(session.run("tree")).toContain("    └── rect#a  x=0 y=0 w=10 h=10");
  });

  it("keeps history rules for io, failure, and nested scale", () => {
    const session = new SessionHarness();
    expect(session.run("help")[0]).toBe("init [w] [h]");
    expect(session.run("undo")).toEqual(["error: no document. use 'init' or 'read' first"]);
    session.run("init");
    expect(session.run("undo")).toEqual(["error: undo not allowed after io command"]);
    session.run("create rect r 10 10 10 10");
    session.run("create g outer");
    session.run("create g inner in outer");
    session.run("create rect leaf 10 20 5 5 in inner");
    session.run("scale outer 2");
    expect(session.run("show leaf")).toContain("  x=20 y=40 width=10 height=10");
    session.run("undo");
    expect(session.run("show leaf")).toContain("  x=10 y=20 width=5 height=5");
    expect(session.run("ungroup outer")).toEqual(["error: cannot ungroup top-level container: outer"]);
    expect(session.run("ungroup inner")).toEqual(["g#inner ungrouped"]);
    expect(session.run("undo")).toEqual(["g#inner regrouped with 1 children"]);
    session.run("save out.svg");
    expect(session.run("undo")).toEqual(["error: undo not allowed after io command"]);
    session.run("move r 1 0");
    expect(session.run("undo")).toEqual(["rect#r moved back to (10,10)"]);
    expect(session.run("undo")).toEqual(["rect#leaf removed"]);
    expect(session.run("create box n1 0 0 1 1 \"t\"")).toEqual([
      "error: unknown shape type: box (is the plugin loaded?)",
    ]);
    expect(session.run("scale r 0")).toEqual(["error: scale factor must be positive"]);
    expect(session.run("# comment")).toEqual([]);
    expect(session.run("read missing.svg")).toEqual(["error: cannot read file: missing.svg"]);
    expect(session.run("tree")[0]).toBe("svg (800x600)");
  });

  it("restores siblings after grouping non-adjacent shapes and after z-order changes", () => {
    const session = new SessionHarness();
    session.run("init");
    session.run("create rect a 0 0 1 1");
    session.run("create rect b 2 0 1 1");
    session.run("create rect c 4 0 1 1");
    session.run("group bundle a c");
    expect(session.run("tree")).toEqual([
      "svg (800x600)",
      "├── g#bundle",
      "│   ├── rect#a  x=0 y=0 w=1 h=1",
      "│   └── rect#c  x=4 y=0 w=1 h=1",
      "└── rect#b  x=2 y=0 w=1 h=1",
    ]);
    expect(session.run("undo")).toEqual(["g#bundle ungrouped"]);
    expect(session.run("tree")).toEqual([
      "svg (800x600)",
      "├── rect#a  x=0 y=0 w=1 h=1",
      "├── rect#b  x=2 y=0 w=1 h=1",
      "└── rect#c  x=4 y=0 w=1 h=1",
    ]);
    session.run("front a");
    expect(session.run("tree")[1]).toBe("├── rect#b  x=2 y=0 w=1 h=1");
    expect(session.run("tree").at(-1)).toBe("└── rect#a  x=0 y=0 w=1 h=1");
    session.run("undo");
    session.run("addto bundle a");
    expect(session.run("addto bundle a")).toEqual(["error: no such shape: bundle"]);
    session.run("create g holder");
    session.run("addto holder a");
    expect(session.run("undo")).toEqual(["rect#a returned to svg"]);
    session.run("create g nested in holder");
    expect(session.run("addto nested holder")).toEqual([
      "error: cannot move a container into its own descendant: holder",
    ]);
  });
});
