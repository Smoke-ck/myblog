// document.addEventListener("DOMContentLoaded", initCarousels );
// if (document.readyState !== "loading") { initCarousels() }

window.onload = initCarousels;


function initCarousels() {
  carousels = document.querySelectorAll('[data-scroll="scroller"]')
  carousels.forEach((element) => {setCarousel(element)})
}

function setCarousel(scroller) {
  let isScrolling = false;

  scroller.innerHTML += scroller.innerHTML
  scroller.scrollLeft = 1600;

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

  function handleWheelEvent(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaX) * scroller.children[0].offsetWidth;
    smoothScroll(scroller, scroller.scrollLeft + delta);
  }

  scroller.addEventListener('wheel', handleWheelEvent, { passive: false });
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

  function smoothScroll(element, to) {
    if (isScrolling) return;
    isScrolling = true;

    const start = element.scrollLeft;
    const change = to - start;
    const duration = 300;
    let currentTime = 0;

    const { scrollLeft, scrollWidth, offsetWidth } = scroller
    const progress = scrollLeft / (scrollWidth - offsetWidth) * 100


    const isForward = (window.scrollProgress <= progress)
    window.scrollProgress = progress;

    // console.log(scrollLeft)
    // console.log(scrollLeft <= offsetWidth && isForward )

    if(offsetWidth + scrollLeft >= scrollWidth - offsetWidth && isForward) {
      console.log('rigth')
      scroller.scrollLeft = scrollLeft - scrollWidth / 2
      window.scrollProgress = 0
      isScrolling = false;
    } else if (scrollLeft <= offsetWidth && !isForward) {
      console.log('left')
      const setPos = () => { scroller.scrollLeft = scrollLeft + scrollWidth / 2};
      requestAnimationFrame(setPos);

      window.scrollProgress = 100
      isScrolling = false;
    } else {
      animateScroll();
    }

    function animateScroll() {
      currentTime += 15;
      const val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollLeft = val;
      if (currentTime < duration) {
        isScrolling = true;

        requestAnimationFrame(animateScroll);
      } else {
        isScrolling = false;
      }
    }


  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

}

function loop({ target, target: { scrollLeft, scrollWidth, offsetWidth } }) {
  const progress = scrollLeft / (scrollWidth - offsetWidth) * 100
  if (window.scrollProgress === progress) return

  const isForward = (window.scrollProgress <= progress)
  window.scrollProgress = progress;

  [...target.children].map(e => {
    const toCenter = Math.abs(window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2)
    const toCenter2 = (window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2)
    const viewport = toCenter / offsetWidth * 100
    const viewport2 = toCenter2 / offsetWidth * 100
    e.style.setProperty('--viewport', viewport)
    e.style.setProperty('--viewport2', viewport2)
  })
  target.style.setProperty('--scroll', Math.floor(progress))
  // console.log('scrollLeft', scrollLeft)

  // if (offsetWidth + scrollLeft >= scrollWidth - offsetWidth && isForward) {
  //   console.log('rigth')
  //   target.scrollLeft = scrollLeft - scrollWidth / 2
  //   window.scrollProgress = 0
  //   return
  // }
  // if (scrollLeft <= offsetWidth && !isForward) {
  //   console.log('left')
  //   target.scrollLeft = scrollLeft + scrollWidth / 2
  //   window.scrollProgress = 100
  //   return
  // }
}