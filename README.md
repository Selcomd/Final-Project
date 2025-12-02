# Teammate Yahir Rico goes by the pseudonym ‘Selcomd’ in our devlog

# Teammate Yuval Szwarcbord goes by the pseudonym ‘Smoopiz’ in our devlog

## Devlog Entry – 11/14/2025

### Introducing the Team

**Yahir Rico — Engine Lead & Testing Lead**\
Responsible for choosing and configuring the core engine platform that is
responsible for the back-end of the game. Also responsible for automated tests,
continuous integration, and human playtesting.

**Yuval S. — Tools Lead & Design Lead**\
Responsible for choose and configuring development tools that will be used in
our project, such as linting, formatting, and deployment automation. Also
responsible for creating a design direction, visual style and puzzle design.

---

## Tools and Materials

### Engine

The game runs on the **baseline web browser platform**, which does not include
built-in 3D rendering or physics. To satisfy the F1 requirements, we chose to
use:

- **Three.js** — third-party 3D rendering\
  https://threejs.org/
- **Cannon-es** — third-party physics simulation\
  https://github.com/pmndrs/cannon-es

These libraries were chosen mainly for their flexibility and strong community
support for further questions on how to implement them into our game.

### Language

We are using:

- **TypeScript** for all game logic
- **JSON** for level and puzzle configuration

We chose TypeScript because it provides strong type safety and JSON because it
helps keeps our data flexible and easy to edit.

### Tools

Our workflow includes:

- **Visual Studio Code** for development
- **GitHub Actions** for automated testing, deployment, screenshot generation,
  and scripted interaction tests
- **npm, ESLint, Prettier** for before-commit automation (linting, formatting,
  and typechecking)

These tools will help support a consistent and automated development environment
that will meet the assignment’s automation requirements.

### Generative AI

We may use non-agentic AI tools (e.g., ChatGPT, GitHub Copilot autocomplete) for
explanation, debugging help, or documentation drafting.\
Might use generative AI in order to write simple code in order to streamline
process of creating the project.

---

## Outlook

Our goal for this project is to create a small puzzle game that has polished
physics and allows the player to manipulate simulated objects with clear visual
feedback in the game.

We believe that the most difficult challenge will be **using Three.js along with
Cannon-es physics**, especially managing timesteps, collisions, and stability.

Through this project, we aim to learn how to create a lightweight engine-style
game ourselves by integrating rendering, physics, controls, state management,
and automated workflows without relying on a full game engine like Unity.

---

## How we satisfied the software requirements (F1)

Our project meets all F1 requirements by building the game using TypeScript and Vite which provide no built in rendering or physics. We then added Three.js to stand in as our third-party 3D rendering library and cannon-es as our physics engine. The player is able to interact with the physics system using keyboard inputs and the resulting motion, collision and force determines whether they succeed or fail at the puzzle(while it is currently really simple). We also added before-commit checks using automation with husky and lint-staged, which checks formatting and linting on every commit. We also added post-push automation using Github actions including automatic build/deployment to pages, automatic screenshot testing, and automated interaction testing. With all of the steps we fully covered the specification for F1.

## Reflection (F1)

Completing all of the F1 requirements made us rethink how much infrastructure a browser game needs beyond just the gameplay code. Especially when using a platform that doesn't already integrate 3D rendering and physics. Early on we assumed that physics and graphics integration would be easy but working with both Three.js and cannon-es made is slightly difficult to pair the two but became easier the more familarized we became with them. Adding automation also changed our workflow because it helped us catch our issues early on instead of coming across them later on. Overall, as a team we shifted from focusing on just individual features that we needed to complete the specification and began thinking about the project as a whole with rendering, physics, and automation supporting each other at each step which has changed how we plan to attempt the rest of the project.

## How we satisfied the software requirements (F2)

We modified our game, main, and renderer files to fit with the F2 requirements by extending our existing Three.js and Cannon-es foundation into a three roomed puzzle. We created a scene transition that allows a player to go into a room and come back from it while keeping their inventory. The three rooms are the main room with a key, a middle room that has a box (that gets unlocked with the key and then can be dragged around), and the last room that has a tightrope to get to the end. Interaction now works through raycasting, allowing the player to click on specific objects such as the key, doors, and the puzzle box. We added a simple inventory system that updates visually and affects gameplay, the key must be collected before the player can unlock the box to beat the second room. Our physics puzzle is solved by dragging the unlocked box onto a pressure button, which opens the door to the final room. That final room includes an L-shaped tightrope the player must carefully navigate, making success depend on their control and reasoning rather than randomness. Once the player gets over the tightrope, they get to a button that allows them to beat the game. These systems satisfy the full F2 specification while maintaining the same rendering and physics engines introduced in F1.

## Reflection (F2)

Completing the F2 requirements made us rethink how interconnected even simple game features become once multiple rooms, interactive objects, and puzzle logic are introduced. F1 was focused on how things look and are created, and F2 made us use all of F1 as an engine and add more scene management, inject interaction, and add an inventory system into it to make it an actual game. We originally assumed adding puzzles and rooms would be straightforward, but integrating Cannon.js physics with Three.js interactions, like dragging objects, unlocking items, and managing multi-scene state, required more refactoring than we thought it would. Building the final L-shaped tightrope also highlighted how sensitive physics-based movement can be in a handcrafted environment. Overall, our team’s thinking shifted from building isolated features toward creating a more maintainable and systemic foundation.