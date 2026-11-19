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