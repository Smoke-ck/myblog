window.onload = initCarousels;

function initCarousels() {
  const carousels = document.querySelectorAll('[data-scroll="scroller"]');
  carousels.forEach((element) => setCarousel(element));
}

function setCarousel(scroller) {
  let items = scroller.querySelectorAll('.animate-visibility');
  let clones = [];
  let disableScroll = false;
  let scrollWidth = 0;
  let scrollPos = 0;
  let clonesWidth = 0;
  let isScrolling = false;
  scroller.innerHTML += scroller.innerHTML;
  const getScrollPos = () => { return scroller.scrollLeft; };
  const setScrollPos = (pos) => { scroller.scrollLeft = pos; };

  function getClonesWidth() {
    clonesWidth = 0;
    clones.forEach(clone => {
      clonesWidth += clone.offsetWidth;
    });
    return clonesWidth;
  }

  function reCalc() {
    scrollPos = getScrollPos();
    scrollWidth = scroller.scrollWidth;
    clonesWidth = getClonesWidth();
    if (scrollPos <= 0) { setScrollPos(1); }
  }

  function scrollUpdate() {
    if (!disableScroll) {
      scrollPos = getScrollPos();
      let val = screen.width <= 768 ? clones[0].offsetWidth/2 : 0
      if (clonesWidth + scrollPos >= scrollWidth) {
        setScrollPos(clonesWidth + val);
        disableScroll = true;
      } else if (scrollPos == 0 ) {
        setScrollPos(scrollWidth - clonesWidth * 2);
        disableScroll = true;
      } else if(scrollPos <= val ){
        setScrollPos(scrollWidth - clonesWidth * 2 + val);
        disableScroll = true;
      }
    }
    if (disableScroll) {
      setTimeout(() => {
        disableScroll = false;
      }, 50);
    }
  }

  function handleWheelEvent(e) {
    e.preventDefault();
    if (disableScroll) return;

    const delta = Math.sign(e.deltaX) * scroller.children[0].offsetWidth;
    smoothScroll(scroller, scroller.scrollLeft + delta);
  }

  function smoothScroll(element, to) {
    if (isScrolling) return;
    isScrolling = true;

    const start = element.scrollLeft;
    const change = to - start;
    const duration = 400;
    let currentTime = 0;

    function animateScroll() {
      currentTime += 20;
      const val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollLeft = val;
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrolling = false;
        requestAnimationFrame(scrollUpdate);
      }
    }

    animateScroll();
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  function onLoad() {
    items.forEach(item => {
      const clone = item.cloneNode(true);
      scroller.appendChild(clone);
      clone.classList.add('js-clone');
    });

    clones = scroller.querySelectorAll('.js-clone');
    getClonesWidth();
    // setScrollPos(clonesWidth);
    let val = screen.width <= 768 ? clones[0].offsetWidth/2 : 0
    setScrollPos(clonesWidth - val);
    reCalc();

    scroller.addEventListener('wheel', handleWheelEvent, { passive: false });
  }
    scroller.addEventListener('touchstart', onTouchStart, { passive: false });
    scroller.addEventListener('touchmove', onTouchMove, { passive: false });

    let startX = 0;
    let isDragging = false;

    function onTouchStart(event) {
      startX = event.touches[0].pageX;
      isDragging = true;
    }

    function onTouchMove(event) {
      if (!isDragging) return;

      const currentX = event.touches[0].pageX;
      const deltaX = currentX - startX > 0 ? -1 : 1;
      smoothScroll(scroller, scroller.scrollLeft + (deltaX * scroller.children[0].offsetWidth ))
    }
    scroller.addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const middle = rect.width / 2;
  
      if (clickX > middle) {
        smoothScroll(scroller, scroller.scrollLeft + scroller.children[1].offsetWidth);
      } else {
        smoothScroll(scroller, scroller.scrollLeft - scroller.children[1].offsetWidth);
      }
    });

  onLoad();
}

function loop({ target, target: { scrollLeft, scrollWidth, offsetWidth } }) {
  const checkPos = () => {
    [...target.children].map(e => {
      const toCenter = Math.abs(window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2)
      const toCenter2 = window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2
      const viewport = toCenter / offsetWidth * 100
      const viewport2 = toCenter2 / offsetWidth * 100
      e.style.setProperty('--viewport', viewport)
      e.style.setProperty('--viewport2', viewport2)
    })
  }
  requestAnimationFrame(checkPos)
}
