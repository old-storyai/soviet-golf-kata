import { ui } from "./executor";
import { invariant } from "@helpers";
import { World, iterComponents, System, EntityId } from "shipyard";
import { GridRender } from "./@helpers/GridRender";
import { moving_character } from "./moving_character";
import { velocity_system } from "./velocity_system";
import { ball_velocity_system } from "./ball_velocity_system";

type GolfBallColors = "blue" | "white" | "red";

const stageHeight = 1440;
const stageWidth = 1440;

const sprites = {
  flag: {
    render: ui.Renderable({
      height: 580,
      width: 300,
      origin_x: 2,
      // account for flag, the position is top left of hole
      origin_y: 467,
      imageID: "flag", // id of loaded image in dom
    }),
    size: ui.Size({
      height: 100,
      width: 150,
    }),
  },
  golfball(version: GolfBallColors) {
    const ballScale = 0.5;
    return {
      render: ui.Renderable({
        height: 240 * ballScale,
        width: 240 * ballScale,
        origin_x: 45 * ballScale,
        // account for flag, the position is top left of hole
        origin_y: 5 * ballScale,
        imageID: `gball-${version}`, // id of loaded image in dom
      }),
      size: ui.Size({
        height: 160 * ballScale,
        width: 160 * ballScale,
      }),
    };
  },
};

function NewGame(viewElt: HTMLCanvasElement) {
  invariant(
    viewElt instanceof HTMLCanvasElement,
    `Game element must be a HTMLCanvaseElement, but got ${viewElt.toString()}`
  );
  const renderer = new GridRender(setupCanvas(viewElt));
  const world = new World();
  let inputCmds: ui.InputCommand[] = [];

  world.add_unique(ui.InputCommands, ui.InputCommands(inputCmds));

  // input listeners
  document.addEventListener("keydown", function ({ key }) {
    switch (key) {
      case "ArrowLeft":
        inputCmds.push(ui.InputCommand.MoveLeft());
        break;
      case "ArrowRight":
        inputCmds.push(ui.InputCommand.MoveRight());
        break;
      case "ArrowDown":
        inputCmds.push(ui.InputCommand.MoveDown());
        break;
      case "ArrowUp":
        inputCmds.push(ui.InputCommand.MoveUp());
        break;
      default:
        console.log(`Unhandled key "${key}"`);
        return;
    }
  });

  viewElt.addEventListener("mousemove", function ({ offsetX, offsetY }) {
    const ratioX = offsetX / this.offsetWidth;
    const ratioY = offsetY / this.offsetHeight;
    while (inputCmds.shift()) {}
    inputCmds.push(
      ui.InputCommand.MoveTowardsPos(
        ui.Position({
          x: ratioX * stageWidth,
          y: ratioY * stageHeight,
        })
      )
    );
  });

  const hero = world.add_entity(
    [ui.Renderable, ui.Size, ui.Hero, ui.Position, ui.Velocity],
    [
      sprites.flag.render,
      sprites.flag.size,
      ui.Hero({
        speed: 100,
      }),
      ui.Position({
        x: stageWidth / 2,
        y: stageHeight / 2,
      }),
      ui.Velocity({ x: 0, y: 0 }),
    ]
  );

  // TODO 1: add other golf balls at random each frame
  function addMovingGolfBall(
    color: GolfBallColors,
    position: ui.Position,
    velocity = ui.Velocity({
      x: 2,
      y: 8,
    })
  ) {
    const sprite = sprites.golfball(color);

    world.add_entity(
      [ui.Renderable, ui.Size, ui.Position, ui.Velocity],
      [sprite.render, sprite.size, position, velocity]
    );
  }

  function addFollowingGolfBall(
    color: GolfBallColors,
    position: ui.Position,
    towards: EntityId,
    velocity = ui.Velocity({
      x: 10,
      y: 10,
    })
  ) {
    const sprite = sprites.golfball(color);

    world.add_entity(
      [ui.Renderable, ui.Size, ui.Position, ui.Velocity, ui.WalkTowards],
      [
        sprite.render,
        sprite.size,
        position,
        velocity,
        ui.WalkTowards(towards as any),
      ]
    );
  }

  addMovingGolfBall(
    "blue",
    ui.Position({
      x: 620,
      y: 500,
    })
  );

  // addMovingGolfBall(
  //   "blue",
  //   ui.Position({
  //     x: 700,
  //     y: 100,
  //   })
  // );

  // addMovingGolfBall(
  //   "red",
  //   ui.Position({
  //     x: 700,
  //     y: 1200,
  //   }),
  //   ui.Velocity({
  //     x: 10,
  //     y: -10,
  //   })
  // );

  addFollowingGolfBall(
    "white",
    ui.Position({
      x: 700,
      y: 1200,
    }),
    hero
  );

  let is_gameover = false;

  world
    .add_workload("default")
    .with_system(moving_character)
    .with_system(ball_velocity_system)
    .with_system(velocity_system)
    .with_system(
      {
        pos: ui.Position,
      },
      (v) => {
        const rand = Math.random();
        if (rand < 0.05) {
          const overlaps = (x1: number, y1: number, x2: number, y2: number) =>
            Math.abs(x1 - x2) < 50 || Math.abs(y1 - y2) < 50;
          const generateSpawnPosition = function (): ui.Position {
            while (true) {
              const spawnPosition = {
                x: Math.random() * stageWidth,
                y: Math.random() * stageHeight,
              };

              let foundFreeSpawnPosition = true;
              for (const pos of v.pos.iter()) {
                if (
                  overlaps(pos[0].x, pos[0].y, spawnPosition.x, spawnPosition.y)
                ) {
                  foundFreeSpawnPosition = false;
                  break;
                }
              }

              if (foundFreeSpawnPosition) {
                return spawnPosition;
              }
            }
          };

          const spawnPosition = generateSpawnPosition();
          const spawnVelocity = {
            x: Math.random() * 20 - 10,
            y: Math.random() * 20 - 10,
          };

          const isFollowingBall = Math.random() < 0.3;
          if (isFollowingBall) {
            addFollowingGolfBall(
              "red",
              ui.Position(spawnPosition),
              hero,
              ui.Velocity(spawnVelocity)
            );
          } else {
            addMovingGolfBall(
              "blue",
              ui.Position(spawnPosition),
              ui.Velocity(spawnVelocity)
            );
          }
        }
      }
    )
    .with_system(
      {
        pos: ui.Position,
        renderable: ui.Renderable,
      },
      (v) => {
        renderer.fillAll("#00ff00");
        for (const [renderable, pos] of iterComponents(v.renderable, v.pos)) {
          renderer.draw(pos.x, pos.y, renderable);
        }
      }
    )
    .with_system(
      // I want all components that have
      {
        pos: ui.Position,
        renderable: ui.Renderable,
        size: ui.Size,
      },
      // so that I can
      (v) => {
        let flag;
        const balls: ui.Position[] = [];
        for (const [renderable, position, size] of iterComponents(
          v.renderable,
          v.pos,
          v.size
        )) {
          if (renderable.imageID === "flag") {
            flag = {
              ...position,
              ...size,
            };
          } else {
            balls.push({
              ...position,
              ...size,
            });
          }
        }

        const xRange = [flag.x, flag.x + flag.width];
        const flagXEnd = flag.x + flag.width;
        const yRange = [flag.y, flag.y + flag.height];
        const flagYEnd = flag.y + flag.height;

        const flagCenter = {
          x: flag.x + flag.width / 2,
          y: flag.y + flag.height / 2,
        };

        if (
          balls.some(({ height, width, x, y }: any) => {
            const ballXEnd = x + width;
            const ballYEnd = y + height;

            if (flagCenter.x <= ballXEnd && flagCenter.x >= x) {
              if (flagCenter.y <= ballYEnd && flagCenter.y >= y) {
                return true;
              }
            }
            // debugger;
            return false;
          })
        ) {
          if (!is_gameover) {
            // we have hit!
            alert("Flag was hit!");
            is_gameover = true
          }
        }
      }
    )
    .build();

  // first cycle
  world.run_default();

  setInterval(function () {
    // tick
    world.run_default();
  }, 80);
}

NewGame(document.getElementById("game") as HTMLCanvasElement);

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext("2d");
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr * 0.5, dpr * 0.5);
  return ctx;
}
