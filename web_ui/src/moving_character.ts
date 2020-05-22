import { ui } from "./executor";
import { iterComponents, unique, system } from "shipyard";

// TODO 2: Movement
// Make moving affect the velocity with a cap rather than affecting the position directly

export const moving_character = system(
  {
    inputCommands: unique(ui.InputCommands),
    hero: ui.Hero,
    pos: ui.Position,
    vel: ui.Velocity,
  },
  (v) => {
    let command: ui.InputCommand | undefined;
    while ((command = v.inputCommands.shift())) {
      ui.applyInputCommand({
        onMoveDown() {
          for (const [{ speed }, pos] of iterComponents(v.hero, v.pos)) {
            pos.y += speed;
          }
        },
        onMoveLeft() {
          for (const [{ speed }, pos] of iterComponents(v.hero, v.pos)) {
            pos.x -= speed;
          }
        },
        onMoveRight() {
          for (const [{ speed }, pos] of iterComponents(v.hero, v.pos)) {
            pos.x += speed;
          }
        },
        onMoveUp() {
          for (const [{ speed }, pos] of iterComponents(v.hero, v.pos)) {
            pos.y -= speed;
          }
        },
        onMoveTowardsPos(towards_pos) {
          for (const [{ speed }, hero_pos, hero_vel] of iterComponents(
            v.hero,
            v.pos,
            v.vel
          )) {
            hero_pos.x = towards_pos.x - 80
            hero_pos.y = towards_pos.y - 30
            
            // const diffX = towards_pos.x - hero_pos.x
            // const diffY = towards_pos.y - hero_pos.y
            // const diffHyp = Math.sqrt(diffX * diffX + diffY * diffY);
            // const ratX = diffX / diffHyp
            // const ratY = diffY / diffHyp

            // hero_vel.x = Math.max(Math.min(speed * ratX, speed * .8), speed * -.8)
            // hero_vel.y = Math.max(Math.min(speed * ratY, speed * .8), speed * -.8)            
          }
        },
      })(command);
    }
  }
);
