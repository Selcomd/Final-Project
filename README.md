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

## How we satisfied the software requirements

Our project meets all F1 requirements by building the game using TypeScript and Vite which provide no built in rendering or physics. We then added Three.js to stand in as our third-party 3D rendering library and cannon-es as our physics engine. The player is able to interact with the physics system using keyboard inputs and the resulting motion, collision and force determines whether they succeed or fail at the puzzle(while it is currently really simple). We also added before-commit checks using automation with husky and lint-staged, which checks formatting and linting on every commit. We also added post-push automation using Github actions including automatic build/deployment to pages, automatic screenshot testing, and automated interaction testing. With all of the steps we fully covered the specification for F1.

## Reflection

Completing all of the F1 requirements made us rethink how much infrastructure a browser game needs beyond just the gameplay code. Especially when using a platform that doesn't already integrate 3D rendering and physics. Early on we assumed that physics and graphics integration would be easy but working with both Three.js and cannon-es made is slightly difficult to pair the two but became easier the more familarized we became with them. Adding automation also changed our workflow because it helped us catch our issues early on instead of coming across them later on. Overall, as a team we shifted from focusing on just individual features that we needed to complete the specification and began thinking about the project as a whole with rendering, physics, and automation supporting each other at each step which has changed how we plan to attempt the rest of the project.