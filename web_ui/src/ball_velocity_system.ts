import { ui } from "./executor";
import { iterComponents, system, getComponent, EntityId } from "shipyard";

export const ball_velocity_system = system(
  {
    velocity: ui.Velocity,
    position: ui.Position,
    towards: ui.WalkTowards,
  },
  (v) => {
    for (const [pos, vel, to] of iterComponents(v.position, v.velocity, v.towards)) {
      //@ts-ignore
      const [towardsPos] = getComponent(to, v.position)!

      const diffX = pos.x - towardsPos.x
      const diffY = pos.y - towardsPos.y

      const newVelocity = Math.random() * 20 + 5



      // TODO: need to avoid zigzag behavior when velocity > difference
      vel.x = diffX === 0 ? 0 : diffX > 0 ? -Math.abs(newVelocity) : Math.abs(newVelocity)
      vel.y = diffY === 0 ? 0 : diffY > 0 ? -Math.abs(newVelocity) : Math.abs(newVelocity)
    }
  }
);
