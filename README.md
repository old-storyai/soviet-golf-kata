# Soviet Golf

> In Soviet Russia, the golf ball aims for you! 

![Screenshot](readme-images/golf.png)

## Storyscript Kata

Two weeks ago, we began discussions about a new general programming paradigm, functional programming! I'm eager to now take everyone through another paradigm called "Data Oriented Design."

While much of the literature about Data Oriented Design touts its performance characteristics and cache-friendliness, I'd like to focus on the ways DOD enables more deliberate ways of introducing features to existing complex or highly interactive systems.

[![ECS Overview](readme-images/overview-thumbnail.png)](https://youtu.be/2rW7ALyHaas)


**Prereqs**

 * Install rust with rustup - https://www.rust-lang.org/tools/install
 * Install wasm-pack cli - https://rustwasm.github.io/wasm-pack/installer/

**Run the code**

```sh
cd web_ui
yarn && yarn start
```

### Interesting files:

 - `web_ui` contains ui code
   - [`web_ui/src/app.ts`](web_ui/src/app.ts) - is main setup
   - web_ui/src/*.ts - are other systems
 - [`web_executor/src/executor.rs`](web_executor/src/executor.rs) (you shouldn't need to touch this file), it defines the source of truth for the components used in Soviet Golf

## TODO:

**Game over:** - Tim & Anukul

If ball hits flag, then alert game over and close tab



**Add golf ball that follows flag pole** - Steve & Jean

Up to your imagination


**Randomize spawning of golf balls with random velocities** - Will & Baptiste

Up to your imagination
