// ============================================
// 1. REGISTER GSAP SCROLLTRIGGER
// ============================================

gsap.registerPlugin(ScrollTrigger);


// ============================================
// 2. SELECT CANVAS AND MAIN ELEMENT
// ============================================

const main = document.querySelector("#main");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");


// ============================================
// 3. IMAGE SEQUENCE VARIABLES
// IMPORTANT: DECLARE THESE BEFORE render()
// OR resizeCanvas() IS CALLED.
// ============================================

const frameCount = 50;

const images = [];

const imageSeq = {
    frame: 0
};

let loadedImages = 0;
let failedImages = 0;


// ============================================
// 4. CANVAS RESIZING
// ============================================

function resizeCanvas() {
    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    // Safe now because images has already been declared.
    render();
}



// 5. IMAGE FILE PATHS

function files(index) {
    const imageNumber = String(index + 1).padStart(4, "0");

    return `./CYBERFICTION-IMAGES/male${imageNumber}.png`;
}


// 6. DRAW IMAGE ON CANVAS
            

function drawImageCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) {
        return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;

    // Scale image to cover the entire canvas.
    const horizontalRatio = width / imageWidth;
    const verticalRatio = height / imageHeight;

    const ratio = Math.max(
        horizontalRatio,
        verticalRatio
    )* 0.75;

    const scaledWidth = imageWidth * ratio;
    const scaledHeight = imageHeight * ratio;

    const centerX = (width - scaledWidth) / 2;
const centerY = height - scaledHeight;

    // const centerX = (width - scaledWidth) / 2;
    // const centerY = (height - scaledHeight) / 2;


    context.clearRect(0, 0, width, height);

    context.drawImage(
        img,
        centerX,
        centerY,
        scaledWidth,
        scaledHeight
    );
}


// ============================================
// 7. RENDER CURRENT IMAGE
// ============================================

function render() {
    // Prevent errors if the image array is empty.
    if (!images.length) {
        return;
    }

    const frameIndex = Math.max(
        0,
        Math.min(
            Math.round(imageSeq.frame),
            frameCount - 1
        )
    );

    const img = images[frameIndex];

    // Draw the current frame if it is loaded.
    if (img && img.complete && img.naturalWidth > 0) {
        drawImageCover(img);
        return;
    }

    // If the requested frame has not loaded,
    // show the nearest available frame.
    for (let distance = 1; distance < frameCount; distance++) {
        const previousImage = images[frameIndex - distance];
        const nextImage = images[frameIndex + distance];

        if (
            previousImage &&
            previousImage.complete &&
            previousImage.naturalWidth > 0
        ) {
            drawImageCover(previousImage);
            return;
        }

        if (
            nextImage &&
            nextImage.complete &&
            nextImage.naturalWidth > 0
        ) {
            drawImageCover(nextImage);
            return;
        }
    }
}


// ============================================
// 8. LOAD ALL 300 IMAGES
// ============================================

function loadImages() {
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();

        // Store each image before its load event fires.
        images.push(img);

        img.onload = function () {
            loadedImages++;

            // Display the first frame immediately.
            if (i === 0) {
                render();
            }

            // Log progress occasionally.
            if (loadedImages % 50 === 0) {
                console.log(
                    `Images loaded: ${loadedImages}/${frameCount}`
                );
            }
        };

        img.onerror = function () {
            failedImages++;

            console.error(
                "Could not load image:",
                img.src
            );
        };

        img.src = files(i);
    }
}


// ============================================
// 9. LOCOMOTIVE SCROLL SETUP
// ============================================

let locoScroll = null;

function locomotive() {
    if (!main) {
        console.error("Element #main was not found.");
        return;
    }

locoScroll = new LocomotiveScroll({
    el: main,
    smooth: true,
    lerp: 0.12,
    multiplier: 1.5
});

    // Synchronize scrolling with ScrollTrigger.
    locoScroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("#main", {
        scrollTop(value) {
            if (arguments.length) {
                locoScroll.scrollTo(value, 0, 0);
            } else {
                return locoScroll.scroll.instance.scroll.y;
            }
        },

        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },

        pinType: main.style.transform ? "transform" : "fixed"
    });

    ScrollTrigger.addEventListener("refresh", function () {
        locoScroll.update();
    });

    // check
    document.querySelector('a[href="#about"]').addEventListener("click", function (e) {
    e.preventDefault();
    locoScroll.scrollTo("#page1");

    
});
document.querySelector('a[href="#Skills"]').addEventListener("click", function(e) {
    e.preventDefault();
    locoScroll.scrollTo("#page2");
});

document.querySelector('a[href="#contact"]').addEventListener("click", function(e) {
    e.preventDefault();
    locoScroll.scrollTo("#page3");
});


document.querySelector('a[href="#ai-chat"]').addEventListener("click", function(e) {
    e.preventDefault();
    locoScroll.scrollTo("#page01");
});


}




// ============================================
// 10. ANIMATE IMAGE SEQUENCE ON SCROLL
// ============================================

function setupImageAnimation() {
    gsap.to(imageSeq, {
        frame: frameCount - 1,

        snap: "frame",

        ease: "none",

        scrollTrigger: {
            trigger: "#page canvas",
            scroller: "#main",
            start: "top top",
            end: "800% top",
            scrub: 0.15
        },

        onUpdate: render
    });

    // Pin canvas during the image sequence.
    ScrollTrigger.create({
        trigger: "#page canvas",
        scroller: "#main",
        start: "top top",
        end: "800% top",
        pin: true

        // Add markers: true here if you need to debug.
    });
}


// ============================================
// 11. PIN PAGE SECTIONS
// ============================================

function setupPageAnimations() {
    ["#page01","#page1", "#page2", "#page3"].forEach(function (selector) {
        const section = document.querySelector(selector);

        if (!section) {
            return;
        }

        ScrollTrigger.create({
            trigger: section,
            scroller: "#main",
            start: "top top",
            end: "bottom top",
            pin: true
        });
    });
}


// ============================================
// 12. INITIALIZE THE WEBSITE
// ============================================

// First set the canvas dimensions.
resizeCanvas();

// Next load the images.
loadImages();

// Initialize smooth scrolling.
locomotive();


// ============================================
// CHAT SCROLL CONTROL
// ============================================

const aiChat = document.getElementById("ai-chat");

if (aiChat) {

    aiChat.addEventListener("mouseenter", () => {
        if (locoScroll) {
            locoScroll.stop();
        }
    });

    aiChat.addEventListener("mouseleave", () => {
        if (locoScroll) {
            locoScroll.start();
        }
    });

}


// Create animations.
setupImageAnimation();
setupPageAnimations();

// Refresh after initialization.
ScrollTrigger.refresh();


// ============================================
// 13. HANDLE WINDOW RESIZE
// ============================================

window.addEventListener("resize", function () {
    resizeCanvas();

    if (locoScroll) {
        locoScroll.update();
    }

    ScrollTrigger.refresh();
});


// ============================================
// 14. DEBUGGING INFORMATION
// ============================================

window.addEventListener("load", function () {
    console.log("Cyberfiction website initialized.");
});

setTimeout(function () {
    console.log("Total images expected:", frameCount);
    console.log("Images successfully loaded:", loadedImages);
    console.log("Images failed to load:", failedImages);
}, 5000);





// ============================================
// 15. TEXT SCRAMBLE ANIMATION
// ============================================

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

document.querySelectorAll(".scramble").forEach((element) => {

    const originalText = element.innerText;
    let interval = null;

    element.addEventListener("mouseenter", () => {

        let iteration = 0;

        clearInterval(interval);

        interval = setInterval(() => {

            element.innerText = originalText
                .split("")
                .map((letter, index) => {

                    if (letter === " ") return " ";

                    if (index < iteration) {
                        return originalText[index];
                    }

                    return letters[Math.floor(Math.random() * letters.length)];

                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }

            iteration += 0.5;

        }, 30);

    });

});



// ============================================
// 16. ASIF AI - BASIC QUESTION ANSWER SYSTEM
// ============================================

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");


// Personal Knowledge Base

const knowledgeBase = [

    {
        keywords: ["who are you", "who is asif", "about asif", "introduce yourself"],
        answer: "I'm Asif, a third-year B.Tech Computer Science Engineering student. I'm passionate about software development, artificial intelligence and exploring emerging technologies."
    },

    {
        keywords: ["education", "college", "degree", "qualification", "study"],
        answer: "Asif is currently pursuing a B.Tech degree in Computer Science Engineering. He is in his third year of engineering."
    },

    {
        keywords: ["skills", "technologies", "technical skills", "programming languages"],
        answer: "Asif has experience with C, C++, Java, Python and JavaScript. He also works with HTML, CSS, Git and GitHub. He is exploring Full-Stack Development and AI integration."
    },

    {
        keywords: ["projects", "project", "work", "portfolio"],
        answer: "Asif has worked on several projects, including Jarvis (a Python voice assistant), an AI chatbot using Groq and Streamlit, a Spotify clone, a calculator and his personal portfolio website."
    },

    {
        keywords: ["jarvis", "voice assistant"],
        answer: "Jarvis is a Python-based personal voice assistant developed by Asif. It uses speech recognition and text-to-speech to interact with users."
    },

    {
        keywords: ["career", "goal", "future", "ambition"],
        answer: "Asif aims to build a career in software development and artificial intelligence. He enjoys learning new technologies and developing practical applications."
    },

    {
        keywords: ["contact", "email", "phone", "address", "gmail"],
        answer: "You can contact Asif through the Contact Me section of this portfolio."
    },

    {
        keywords: ["hobbies", "interests", "passion"],
        answer: "Asif enjoys exploring new technologies, programming, solving problems and building practical projects."
    }

];


// Display Messages

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.classList.add(
        sender === "user" ? "user-message" : "ai-message"
    );

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    messageDiv.appendChild(paragraph);

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Find AI Answer

function getAIResponse(question) {

    const userQuestion = question.toLowerCase();

    for (let item of knowledgeBase) {

        if (item.keywords.some(keyword => userQuestion.includes(keyword))) {
            return item.answer;
        }

    }

    return "I'm sorry, I don't have that information about Asif yet. Try asking me about his education, skills, projects or career goals.";
}


// Send Message

function sendMessage() {

    const question = userInput.value.trim();

    if (question === "") return;

    addMessage(question, "user");

    const answer = getAIResponse(question);

    setTimeout(() => {
        addMessage(answer, "ai");
    }, 500);

    userInput.value = "";

}


// Send Button

sendButton.addEventListener("click", sendMessage);


// Enter Key

userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});


// Suggested Questions

document.querySelectorAll("#suggested-questions button").forEach(button => {

    button.addEventListener("click", function() {

        userInput.value = this.innerText;

        sendMessage();

    });

});

// ============================================
// 17. ASIF AI - VOICE INPUT
// ============================================

const micButton = document.getElementById("mic-button");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.addEventListener("click", () => {

        recognition.start();

        micButton.innerText = "🔴";

    });

    recognition.onresult = function(event) {

        const transcript = event.results[0][0].transcript;

        userInput.value = transcript;

        sendMessage();

    };

    recognition.onend = function() {

        micButton.innerText = "🎤";

    };

    recognition.onerror = function(event) {

        console.error("Speech recognition error:", event.error);

        micButton.innerText = "🎤";

        if (event.error === "not-allowed") {
            alert("Please allow microphone access to use voice input.");
        }

    };

} else {

    micButton.disabled = true;
    micButton.title = "Speech recognition is not supported in this browser.";

}







//lamp animation


// ============ PULL-CORD LAMP ============
(function () {
    const lamp = document.getElementById("lamp");
    if (!lamp) return;

    const handle = lamp.querySelector(".cord-handle");
    const MAX_PULL = 70;      // how far the cord can stretch (px)
    const TRIGGER = 35;       // pull at least this far to switch
    let startY = 0, pull = 0, pulling = false, moved = false;

    function setPull(px) {
        pull = px;
        lamp.style.setProperty("--pull", px + "px");
    }

    function swing() {
        lamp.classList.remove("swing");
        void lamp.offsetWidth;            // restart the animation
        lamp.classList.add("swing");
    }

    function setDark(isDark) {
        document.body.classList.toggle("dark", isDark);
        try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
    }

    function toggle() {
        setDark(!document.body.classList.contains("dark"));
        swing();
    }

    // Restore saved theme
    try { if (localStorage.getItem("theme") === "dark") setDark(true); } catch (e) {}

    handle.addEventListener("pointerdown", (e) => {
        pulling = true; moved = false;
        startY = e.clientY;
        handle.setPointerCapture(e.pointerId);
        lamp.classList.add("dragging");
        e.preventDefault();
    });

    handle.addEventListener("pointermove", (e) => {
        if (!pulling) return;
        const d = Math.max(0, Math.min(MAX_PULL, e.clientY - startY));
        if (d > 4) moved = true;
        setPull(d);
    });

    function release() {
        if (!pulling) return;
        pulling = false;
        lamp.classList.remove("dragging");
        if (pull >= TRIGGER || !moved) toggle();   // a simple tap also works on phones
        setPull(0);                                 // spring back
    }
    handle.addEventListener("pointerup", release);
    handle.addEventListener("pointercancel", release);

    // Keyboard: focus the bead and press Enter or Space
    handle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPull(45);
            setTimeout(() => { setPull(0); toggle(); }, 120);
        }
    });
})();




// skill rotation

// ============ ROTATING SKILL SPHERE ============
(function () {
    const box = document.getElementById("skill-sphere");
    if (!box) return;

    const items = Array.from(box.querySelectorAll(".skill"));
    const n = items.length;
    if (!n) return;

    const AUTO_SPEED = 0.35;      // radians per second of idle spin
    const FRICTION = 2.2;         // how fast drag momentum fades
    const FOV = 3;                // perspective strength (bigger = flatter)

    // Evenly spread points over a sphere (Fibonacci sphere)
    const pts = items.map((_, i) => {
        const y = 1 - (2 * (i + 0.5)) / n;
        const r = Math.sqrt(1 - y * y);
        const theta = Math.PI * (3 - Math.sqrt(5)) * i;
        return { x: Math.cos(theta) * r, y: y, z: Math.sin(theta) * r };
    });

    let radius = 0;
    let vy = AUTO_SPEED;
    let vx = 0.08;
    let dragging = false, hovering = false, visible = true;
    let lastX = 0, lastY = 0, lastT = 0;

    function measure() { radius = box.clientWidth / 2 * 0.82; }

    function rotate(ax, ay) {
        const cy = Math.cos(ay), sy = Math.sin(ay);
        const cx = Math.cos(ax), sx = Math.sin(ax);
        for (const p of pts) {
            let x = p.x * cy + p.z * sy;
            let z = -p.x * sy + p.z * cy;
            let y = p.y * cx - z * sx;
            z = p.y * sx + z * cx;
            const len = Math.hypot(x, y, z) || 1;
            p.x = x / len; p.y = y / len; p.z = z / len;
        }
    }

    function draw() {
        for (let i = 0; i < n; i++) {
            const p = pts[i];
            const scale = FOV / (FOV - p.z);          // front bigger, back smaller
            const px = p.x * radius * scale;
            const py = p.y * radius * scale;
            const depth = (p.z + 1) / 2;              // 0 (back) .. 1 (front)
            const el = items[i];
            el.style.transform =
                "translate(-50%, -50%) translate(" + px.toFixed(1) + "px, " + py.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
            el.style.opacity = (0.4 + 0.6 * depth).toFixed(2);
            el.style.zIndex = Math.round(depth * 100);
        }
    }

    let prev = performance.now();
    function frame(now) {
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        if (visible) {
            if (!dragging) {
                const idle = hovering ? AUTO_SPEED * 0.2 : AUTO_SPEED;
                const k = Math.min(1, FRICTION * dt);
                vy += (Math.sign(vy || 1) * idle - vy) * k;
                vx += (0.08 - vx) * k;
                rotate(vx * dt, vy * dt);
            }
            draw();
        }
        requestAnimationFrame(frame);
    }

    // Drag to spin
    box.addEventListener("pointerdown", (e) => {
        dragging = true;
        lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
        box.classList.add("dragging");
        box.setPointerCapture(e.pointerId);
    });
    box.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const now = performance.now();
        const dt = Math.max((now - lastT) / 1000, 0.001);
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        const ay = (dx / radius) * 1.4, ax = (-dy / radius) * 1.4;
        rotate(ax, ay);
        vy = Math.max(-6, Math.min(6, ay / dt));
        vx = Math.max(-6, Math.min(6, ax / dt));
        lastX = e.clientX; lastY = e.clientY; lastT = now;
        draw();
    });
    function endDrag() { dragging = false; box.classList.remove("dragging"); }
    box.addEventListener("pointerup", endDrag);
    box.addEventListener("pointercancel", endDrag);

    box.addEventListener("mouseenter", () => { hovering = true; });
    box.addEventListener("mouseleave", () => { hovering = false; });

    // Pause when the section is off-screen
    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
        }).observe(box);
    }

    window.addEventListener("resize", () => { measure(); draw(); });

    measure();
    draw();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        requestAnimationFrame(frame);
    }
})();




// ============ SLICE TEXT (reusable effect) ============
// Usage: add class="slice-text" to any block element (div, h1, h2, p ...).
// Optional per-element settings (all optional):
//   data-color="#58A6FF"   dot colour (hex or "r,g,b")      default 180,210,255
//   data-hot="#ffffff"     colour dots turn when pushed     default white
//   data-gap="3.5"         distance between dots (px)       default scales with font size
//   data-dot="1.5"         dot size (px)                    default scales with font size
//   data-radius="50"       size of the "cut" around cursor  default scales with font size
(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SELECTOR = ".slice-text";
    const BASE_FONT = 64;          // the original animation was designed at 64px text
    const PAD = 20;                // room around the text so flying dots are not cut off

    // Physics: same values as the original animation
    const REPEL_FORCE = 4.0;
    const RETURN_SPEED = 0.1;
    const DAMPING = 0.85;

    const DEFAULT_COLOR = [180, 210, 255];
    const DEFAULT_HOT = [255, 255, 255];

    const instances = [];
    let loopRunning = false;

    function parseColor(v, fallback) {
        if (!v) return fallback;
        v = v.trim();
        if (v[0] === "#") {
            let h = v.slice(1);
            if (h.length === 3) h = h.split("").map((c) => c + c).join("");
            const n = parseInt(h, 16);
            if (h.length !== 6 || isNaN(n)) return fallback;
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        }
        const m = v.split(/[\s,]+/).map(Number);
        return m.length >= 3 && m.every((x) => !isNaN(x)) ? m.slice(0, 3) : fallback;
    }

    function transformText(text, cs) {
        const t = cs.textTransform;
        if (t === "uppercase") return text.toUpperCase();
        if (t === "lowercase") return text.toLowerCase();
        if (t === "capitalize") return text.replace(/\b\w/g, (c) => c.toUpperCase());
        return text;
    }

    function create(el) {
        if (el.__slice) return;

        const canvas = document.createElement("canvas");
        canvas.className = "slice-canvas";
        canvas.setAttribute("aria-hidden", "true");
        el.appendChild(canvas);

        if (getComputedStyle(el).position === "static") el.style.position = "relative";

        const inst = {
            el, canvas,
            ctx: canvas.getContext("2d"),
            points: [],
            mouse: { x: -9999, y: -9999, active: false },
            visible: true,
            built: false,
            settled: true,
            w: 0, h: 0,
            P: null
        };
        el.__slice = inst;
        instances.push(inst);

        function setMouse(clientX, clientY) {
            const r = el.getBoundingClientRect();
            inst.mouse.x = clientX - (r.left + el.clientLeft) + PAD;
            inst.mouse.y = clientY - (r.top + el.clientTop) + PAD;
            inst.mouse.active = true;
            inst.settled = false;
        }
        el.addEventListener("mousemove", (e) => setMouse(e.clientX, e.clientY));
        el.addEventListener("mouseleave", () => {
            inst.mouse.active = false; inst.mouse.x = inst.mouse.y = -9999;
        });
        // Touch follows the finger but never blocks page scrolling
        el.addEventListener("touchmove", (e) => {
            if (e.touches.length) setMouse(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        el.addEventListener("touchend", () => { inst.mouse.active = false; });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver((en) => {
                inst.visible = en[0].isIntersecting;
                if (inst.visible && !inst.built) build(inst);
            }).observe(el);
        }
        if ("ResizeObserver" in window) {
            let t;
            new ResizeObserver(() => {
                clearTimeout(t);
                t = setTimeout(() => build(inst), 120);
            }).observe(el);
        } else {
            window.addEventListener("resize", () => build(inst));
        }

        build(inst);
        startLoop();
    }

    function build(inst) {
        const el = inst.el;
        if (!el.clientWidth || !el.clientHeight) { inst.built = false; return; }

        const elRect = el.getBoundingClientRect();
        const ox = elRect.left + el.clientLeft;
        const oy = elRect.top + el.clientTop;
        const W = Math.ceil(el.clientWidth) + PAD * 2;
        const H = Math.ceil(el.clientHeight) + PAD * 2;

        // 1. Find every word of the real text and exactly where the browser placed it
        const words = [];
        let fontSize = 0;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            const cs = getComputedStyle(parent);
            if (cs.display === "none" || cs.visibility === "hidden") continue;

            const font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
            const re = /\S+/g;
            let m;
            while ((m = re.exec(node.data))) {
                const range = document.createRange();
                range.setStart(node, m.index);
                range.setEnd(node, m.index + m[0].length);
                const rects = range.getClientRects();
                if (!rects.length) continue;
                const b = rects[0];
                words.push({
                    text: transformText(m[0], cs),
                    x: b.left - ox + PAD,
                    y: b.top + b.height / 2 - oy + PAD,
                    font: font,
                    ls: cs.letterSpacing
                });
                fontSize = Math.max(fontSize, parseFloat(cs.fontSize) || 0);
            }
        }

        // 2. Settings (scale with font size so small text still looks good)
        const s = Math.min(4, Math.max(0.25, (fontSize || BASE_FONT) / BASE_FONT));
        const d = el.dataset;
        inst.P = {
            gap: Math.max(1.2, parseFloat(d.gap) || 2.5 * s),
            dot: parseFloat(d.dot) || Math.max(0.6, 1.5 * s),
            grow: Math.max(0.3, 0.8 * s),
            radius: parseFloat(d.radius) || Math.max(25, 50 * s),
            color: parseColor(d.color, DEFAULT_COLOR),
            hot: parseColor(d.hot, DEFAULT_HOT)
        };

        // 3. Canvas sizing (covers the element plus PAD on every side)
        inst.w = W; inst.h = H;
        const dpr = window.devicePixelRatio || 1;
        const c = inst.canvas;
        c.width = W * dpr;
        c.height = H * dpr;
        c.style.width = W + "px";
        c.style.height = H + "px";
        c.style.left = -PAD + "px";
        c.style.top = -PAD + "px";
        inst.ctx.setTransform(1, 0, 0, 1, 0, 0);
        inst.ctx.scale(dpr, dpr);

        // 4. Draw the words off-screen, then turn the text pixels into dots
        const off = document.createElement("canvas");
        off.width = W; off.height = H;
        const octx = off.getContext("2d");
        octx.textAlign = "left";
        octx.textBaseline = "middle";
        octx.fillStyle = "#ffffff";
        for (const w of words) {
            octx.font = w.font;
            if ("letterSpacing" in octx) octx.letterSpacing = w.ls === "normal" ? "0px" : w.ls;
            octx.fillText(w.text, w.x, w.y);
        }
        const data = octx.getImageData(0, 0, W, H).data;

        const gap = inst.P.gap;
        inst.points = [];
        for (let y = 0; y < H; y += gap) {
            for (let x = 0; x < W; x += gap) {
                if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) {
                    inst.points.push({ homeX: x, homeY: y, x: x, y: y, vx: 0, vy: 0 });
                }
            }
        }

        inst.built = true;
        inst.settled = true;
        draw(inst);
        if (words.length) el.classList.add("slice-ready");   // hide the real text, dots take over
    }

    function draw(inst) {
        const { ctx, points, P } = inst;
        ctx.clearRect(0, 0, inst.w, inst.h);
        const c0 = P.color, c1 = P.hot;
        for (const p of points) {
            const dx = p.homeX - p.x, dy = p.homeY - p.y;
            const intensity = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.15, 1);
            ctx.beginPath();
            ctx.arc(p.x, p.y, P.dot + intensity * P.grow, 0, Math.PI * 2);
            ctx.fillStyle =
                "rgb(" + Math.floor(c0[0] + (c1[0] - c0[0]) * intensity) + "," +
                Math.floor(c0[1] + (c1[1] - c0[1]) * intensity) + "," +
                Math.floor(c0[2] + (c1[2] - c0[2]) * intensity) + ")";
            ctx.fill();
        }
    }

    function step(inst) {
        const { points, mouse, P } = inst;
        if (!points.length || (inst.settled && !mouse.active)) return;

        let moving = false;
        for (const p of points) {
            const dx = p.homeX - p.x;
            const dy = p.homeY - p.y;
            p.vx += dx * RETURN_SPEED;
            p.vy += dy * RETURN_SPEED;

            if (mouse.active) {
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (dist < P.radius && dist > 0.001) {
                    const force = (1 - dist / P.radius) * REPEL_FORCE;
                    p.vx += (mdx / dist) * force;
                    p.vy += (mdy / dist) * force;
                }
            }

            p.vx *= DAMPING;
            p.vy *= DAMPING;
            p.x += p.vx;
            p.y += p.vy;

            if (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 ||
                Math.abs(p.homeX - p.x) > 0.02 || Math.abs(p.homeY - p.y) > 0.02) moving = true;
        }

        if (!moving && !mouse.active) {          // everything is back home: stop working
            for (const p of points) { p.x = p.homeX; p.y = p.homeY; p.vx = p.vy = 0; }
            inst.settled = true;
        }
        draw(inst);
    }

    function startLoop() {
        if (loopRunning) return;
        loopRunning = true;
        (function loop() {
            for (const inst of instances) {
                if (inst.built && inst.visible) step(inst);
            }
            requestAnimationFrame(loop);
        })();
    }

    function scan() {
        document.querySelectorAll(SELECTOR).forEach(create);
    }

    // Rebuild after fonts and images finish loading (they change text positions)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => instances.forEach(build));
    }
    window.addEventListener("load", () => instances.forEach(build));

    // Small public API, in case you add text with JavaScript later
    window.SliceText = {
        refresh: () => { scan(); instances.forEach(build); },
        add: create
    };

    scan();
})();