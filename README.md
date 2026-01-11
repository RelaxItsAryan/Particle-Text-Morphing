# Particle Text Morphing – Three.js
# Website Link - [Particle Text Morphing](https://particle-text-morphing.vercel.app/)

An interactive Three.js particle animation where thousands of particles smoothly morph between a rotating 3D sphere and custom user‑entered text. The project combines WebGL, GSAP animations, and a modern UI to create a visually engaging experience directly in the browser.

# ✨ Features

🔮 12,000 animated particles rendered with Three.js

🔄 Smooth morphing animation between sphere and text shapes

✍️ User‑input text morphing (up to 20 characters)

🎨 Dynamic color gradients based on depth

🌀 Continuous 3D rotation in sphere mode

⚡ GSAP‑powered smooth transitions

📱 Fully responsive and works on all screen sizes

# 🛠️ Tech Stack

HTML5 – Structure

CSS3 – Glassmorphism UI & styling

JavaScript (ES6) – Logic & animation control

Three.js – 3D rendering & particles

GSAP – Smooth morphing animations

# 📂 Project Structure
project-folder/
│
├── index.html      # Main HTML file
├── style.css       # UI & layout styling
├── script.js       # Three.js & animation logic
└── README.md       # Project documentation
# 🚀 How It Works

Initial State
On load, particles are distributed evenly on a rotating 3D sphere.

Text Morphing

User enters text in the input field

Text is drawn on a hidden canvas

Visible pixels are converted into particle positions

Particles smoothly animate to form the text

Auto Return
After a few seconds, particles automatically morph back into the rotating sphere.

# ▶️ How to Run

Download or clone the project

Open index.html in any modern browser (Chrome, Edge, Firefox)

Type text in the input field

Click Create or press Enter

No build tools or server required – works directly in the browser.

# ⚙️ Customization

You can easily tweak the experience:

Particle count
Change the value of count in script.js

Sphere size
Modify the radius value inside sphericalDistribution()

Animation speed
Adjust GSAP duration values

Font style
Update the canvas font in createTextPoints()

# 📸 Use Cases

Portfolio background animation

Landing page hero section

Creative coding projects

WebGL / Three.js learning demo

# 📜 License

This project is open‑source and free to use for learning, personal projects, and portfolios.

# 🙌 Credits

Three.js – 3D graphics library

GSAP – Animation engine
