// 待重构：按名分派。类型名 / SVG 标签 → ShapeProvider 的唯一登记处。
import { CircleShapeProvider } from "../domain/CircleShapeProvider.js";
import { EllipseShapeProvider } from "../domain/EllipseShapeProvider.js";
import { GroupShapeProvider } from "../domain/GroupShapeProvider.js";
import { LineShapeProvider } from "../domain/LineShapeProvider.js";
import { RectShapeProvider } from "../domain/RectShapeProvider.js";
import type { ShapeRegistry } from "../domain/ShapeRegistry.js";
import { TextShapeProvider } from "../domain/TextShapeProvider.js";

export class ShapeBindings {
  static registerBuiltins(registry: ShapeRegistry): void {
    registry.register(new RectShapeProvider());
    registry.register(new CircleShapeProvider());
    registry.register(new EllipseShapeProvider());
    registry.register(new LineShapeProvider());
    registry.register(new TextShapeProvider());
    registry.register(new GroupShapeProvider());
  }
}
