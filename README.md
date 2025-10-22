# 🌦️ Interactive Water Cycle Learning Experience (For Kids)

👋 Welcome!  
This project is a fun and interactive learning tool designed especially for young kids (around 7–8 years old) to help them understand the **Water Cycle** — how water moves in nature through the sun, clouds, evaporation, and rain!

---

## 🖼️ DEMO

![Water Cycle Demo](moutain.png)

👉 **[Try it Online in p5.js Editor](https://editor.p5js.org/Bhanupal/sketches/st5agwuvM)**

---

## ✨ Features

🌞 **Drag the Sun** using your hand or mouse to evaporate water  
💨 **Move Clouds** using gestures to simulate wind and collisions  
🌧️ **Rain starts** when clouds collide  
⚡ **Lightning and thunder effects** with visuals and sound  
💡 **Arduino Integration:** LEDs, fan, and sprinkler simulate real-world weather  
🎵 **Soothing background music** and nature sounds  

---

## 🧠 What Will Kids Learn?

This simulation visually teaches the **four key stages** of the Water Cycle:

| Stage | Description |
|--------|--------------|
| ☀️ Evaporation | Sun heats up water to form vapor |
| ☁️ Condensation | Vapor cools and forms clouds |
| 🌧️ Precipitation | Clouds collide and rain falls |
| 💧 Collection | Water gathers in lakes, restarting the cycle |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| **p5.js** | Canvas drawing and animation |
| **ml5.js** | BlazePose model for hand/body tracking |
| **JavaScript** | Core logic and interactions |
| **Arduino + Serial Communication** | Connects fan, LEDs, and sprinkler |
| **Images & Sounds** | Makes the experience immersive |

---

## 💡 How to Run the Project

### ✅ Option 1: Run Online (Easiest)

1. Open the project on [p5.js Editor](https://editor.p5js.org/Bhanupal/sketches/st5agwuvM)  
2. Click ▶️ **Play**  
3. Allow **camera access** when prompted (for hand detection)  
4. Move your hand to interact with the **Sun** and **Clouds!**

---

### 💻 Option 2: Run Locally

```bash
git clone https://github.com/Bhanupal22600/interactive-water-cycle.git
cd interactive-water-cycle


Then open index.html in your browser.

Optional: Hardware Integration

Upload the provided Arduino code (waterCycleLED.ino)

Connect LEDs, fan, and water pump

Connect Arduino to your computer via USB

Use p5.serialport for serial communication between browser and Arduino

🔌 Hardware Integration Summary
Action	Real-World Effect
☀️ Dragging the Sun	Fan turns ON (wind)
🌫️ Vapor rising	LED lights ON
☁️ Clouds moving	Wind sound + fan
⚡ Cloud collisions	Thunder LEDs ON
🌧️ Rain starts	Sprinkler turns ON

All these are controlled using serial signals from p5.js → Arduino.

📂 File Structure
/interactive-water-cycle
│
├── index.html          # Entry point
├── learn.js            # Main p5.js code
├── ocean.mp3           # Background music
├── vapour.mp3          # Evaporation sound
├── rain.mp3            # Rain sound
├── cloud1.png          # Cloud image
├── cloud2.png          # Cloud image
├── mountain.png        # Mountain image
├── cow.gif             # Cow animation
└── waterCycleLED.ino   # Arduino code

🎯 Why This Project?

Learning is best when it’s fun and interactive!
This simulation combines science, visuals, sound, real-world hardware, and motion tracking to create a memorable and engaging way for children to understand how nature works.

🙌 Made With Love

Designed and developed by Bhanu Pal ❤️
Built for learning, creativity, and curious young minds 🌈