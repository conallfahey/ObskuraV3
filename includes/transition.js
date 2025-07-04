document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".transit").forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault(),
        (function () {
          const t = gsap.timeline();
          (document.body.style.cursor = "progress"),
            t
              .addLabel("start", 0)
              .fromTo(
                ".transition-out",
                { scaleY: 0 },
                { scaleY: 1, duration: 1.2, ease: "power2.inOut" },
                "start"
              ),
            document.querySelector(".transition-in")
              ? gsap.to(
                  ".transition-in",
                  {
                    scaleY: 1,
                    duration: 1.1,
                    ease: "power2.inOut",
                    onComplete: () => {
                      document.body.style.cursor = "default";
                    },
                  },
                  "start+=1.0"
                )
              : (gsap.to(
                  ".transition-out",
                  {
                    scaleY: 0,
                    duration: 1.1,
                    ease: "power2.inOut",
                    onComplete: () => {
                      document.body.style.cursor = "default";
                    },
                  },
                  "start+=1.0"
                ),
                console.warn("transition not found"));
        })(),
        setTimeout(() => {
          window.location.href = t.href;
        }, 1e3);
    });
  });
}),
  window.addEventListener("pageshow", function (t) {
    t.persisted && window.location.reload();
  });
