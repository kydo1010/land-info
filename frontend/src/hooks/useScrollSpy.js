import { useEffect, useState } from "react";

// 스크롤 위치에 따라 리포트의 어느 섹션(id)이 화면에 보이는지 추적하고, 앵커 pill 클릭 시 해당
// 섹션으로 부드럽게 스크롤 이동시키는 동작을 담당한다. sectionIds는 상단부터 순서대로.
export function useScrollSpy(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const onScroll = () => {
      let cur = sectionIds[0];
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 240) cur = id;
      });
      setActiveSection((prev) => (prev === cur ? prev : cur));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 176, behavior: "smooth" });
  };

  return { activeSection, goTo };
}
