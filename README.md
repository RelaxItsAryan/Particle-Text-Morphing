# Particle Text Morphing – Three.js
# Website Link - [Particle Text Morphing](https://particle-text-morphing.vercel.app/)

An interactive Three.js particle animation where thousands of particles smoothly morph between a rotating 3D sphere and custom user‑entered text. The project combines WebGL, GSAP animations, and a modern UI to create a visually engaging experience directly in the browser.

## Quick Overview
This experiment utilizes high-performance **BufferGeometry** to manage over 12,000 active particles. By rendering text to a hidden canvas and extracting pixel coordinates, the system dynamically transforms a 3D sphere into readable text in real-time.

# ✨ Features

* 🔮 **12,000 Particles:** High-density particle system rendered efficiently using Three.js `BufferGeometry` for optimal WebGL performance.
* 🔄 **Fluid Morphing:** Seamless transitions between a 3D spherical distribution and custom text shapes powered by GSAP.
* ✍️ **Interactive Text:** Real-time generation of particle coordinates based on user-entered text (supports up to 20 characters).
* 🎨 **Depth-Based Coloring:** Dynamic HSL color gradients that change based on each particle's distance from the center of the scene.
* 🌀 **Continuous Animation:** An "Initial State" featuring a continuously rotating 3D sphere for an engaging idle experience.
* ⚡ **GSAP Transitions:** Smooth, high-performance coordinate interpolation using `power2.inOut` easing.
* 📱 **Responsive UI:** A fully responsive layout with a modern Glassmorphism input overlay that works across various screen sizes.

# 🛠️ Tech Stack

* **HTML5 Canvas:** Used to extract pixel coordinates from user-entered text.
* **CSS3:** Modern Glassmorphism UI with "Inter" typography.
* **JavaScript (ES6):** Logic & animation control
* **Three.js (r128):** 3D engine and particle management.
* **GSAP (3.7.1):** High-performance animation engine for `power2.inOut` easing.

# 📂 Project Structure
```text
├── index.html      # UI structure and external library CDNs
├── style.css       # Glassmorphism effects and responsive layouts
├── script.js       # Core logic: Three.js scene & morphing algorithms
└── LICENSE         # MIT License information
```
# 🚀 How It Works

The animation logic is divided into three core phases:

### 1. The Spherical Distribution (Initial State)
Upon initialization, particles are mathematically distributed across a rotating 3D sphere using an Archimedean spiral distribution.
* **Phi:** Calculated as `Math.acos(-1 + (2 * i) / count)`.
* **Theta:** Calculated as `Math.sqrt(count * Math.PI) * phi`.
* **Depth Shading:** A dynamic HSL color is assigned based on the distance from the origin ($0,0,0$) to create visual depth.

### 2. Canvas-Based Pixel Extraction (The Map)
When you input text, the script creates a hidden 2D canvas to render the characters.
* **Text Processing:** The code uses `wrapText()` to handle multi-word strings and adjust font size dynamically based on the window width.
* **Coordinate Mapping:** The script scans the `ImageData` for pixels above a brightness threshold ($110$).
* **Sampling:** Only approximately $32\%$ of the detected pixels are sampled to maintain a consistent particle count of 12,000.

### 3. GSAP Interpolation (The Morph)
The transition between the sphere and the text (and back) is handled by GSAP.
* [**Position Morphing:** GSAP targets the $x, y, z$ coordinates in the `BufferGeometry` and interpolates them over a 2-second duration using `power2.inOut` easing.
* **Color Transitioning:** Simultaneously, the HSL color values are updated to smooth the visual transition.
* **Auto-Return:** A `setTimeout` trigger ensures that after 4 seconds of displaying text, the particles automatically morph back into the rotating sphere state.

# ▶️ How to Run

This project is built using pure JavaScript and Three.js modules, requiring no build tools or `npm` installations.

### 1. Locally on your Computer
1.  **Download/Clone:** Download the repository as a ZIP file or clone it using:
    ```bash
    git clone [https://github.com/your-username/particle-text-morphing.git](https://github.com/your-username/particle-text-morphing.git)
    ```
2.  **Open Browser:** Locate the folder and double-click `index.html`.
3.  **Interaction:** Use the input box at the bottom to type text and press the "Create" button or the **Enter** key.

### 2. Using VS Code "Live Server" (Recommended)
If you are a developer using VS Code, it is best to run the project through a local server to avoid potential browser security (CORS) issues with JavaScript modules:
1.  Install the **Live Server** extension in VS Code.
2.  Right-click `index.html` and select **"Open with Live Server"**.
3.  The project will automatically open in your default browser at `http://127.0.0.1:5500`.

---

## 🛠️ Usage Tips
* **Characters:** For the best visual results, keep your text under 20 characters.
* **Browser:** Use a modern browser like Chrome, Edge, or Firefox for optimal WebGL performance.
* **Auto-Reset:** The particles will automatically return to the sphere shape 4 seconds after your text appears.

# ⚙️ Customization

ou can easily modify the experience in `script.js`:

* **Particle Density:** Change `const count = 12000;` to adjust the number of particles.
* **Sphere Scale:** Modify the `8` multiplier inside `sphericalDistribution()` to change the sphere size.
* **Animation Timing:** Adjust the `duration: 2` values in the GSAP tweens for faster or slower morphs.
* **Auto-Reset Timer:** Change the `4000` ms value in the `setTimeout` function to adjust text display time.

# 📸 Use Cases

This project serves as a versatile foundation for various creative web applications:

* **Portfolio Hero Section:** Use the particle sphere as a high-impact, interactive background for a developer or designer portfolio.
* **Creative Coding Education:** A clear example of how to combine `Three.js` BufferGeometry with `GSAP` for complex coordinate interpolation.
* **Landing Page Interactivity:** Engage users by allowing them to "type" their own brand name or call-to-action into the site’s visual DNA.
* **WebGL Performance Testing:** Benchmarking how different browsers handle 12,000+ active particles with real-time math calculations.

# 📜 License

This project is open‑source and free to use for learning, personal projects, and portfolios.

# 🙌 Credits

This project was made possible by these incredible open-source tools:

* **[Three.js](https://threejs.org/):** The core 3D graphics library used for WebGL rendering and particle management.
* **[GSAP](https://greensock.com/gsap/):** The industry-leading animation engine used for the smooth coordinate interpolation between shapes.
* **[Google Fonts](https://fonts.google.com/specimen/Inter):** The "Inter" typeface provides the modern, high-legibility UI.
* **[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API):** Used to extract precise pixel coordinates from user-entered text.
