const canvas =
    document.getElementById("particleCanvas");

const ctx =
    canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];

for (let i = 0; i < 80; i++) {

    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3,
        d: Math.random() * 2
    });
}

function animateParticles() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(56,189,248,0.5)";

    particles.forEach(p => {

        ctx.beginPath();

        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        ctx.fill();

        p.y += p.d;

        if (p.y > canvas.height) {
            p.y = 0;
        }
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();
