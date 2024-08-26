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
  let mobileStep = screen.width <= 768 ? scroller.children[0].offsetWidth / 2 : 0;
  let isDragging = false;

  scroller.innerHTML += scroller.innerHTML;
  const getScrollPos = () => scroller.scrollLeft;
  const setScrollPos = (pos) => scroller.scrollLeft = pos;

  items.forEach(item => {
    const clone = item.cloneNode(true);
    scroller.appendChild(clone);
    clone.classList.add('js-clone');
  });

  clones = scroller.querySelectorAll('.js-clone');
  getClonesWidth();
  setScrollPos(clonesWidth - mobileStep);
  reCalc();

  function getClonesWidth() {
    clonesWidth = 0;
    clones.forEach(clone => { clonesWidth += clone.offsetWidth; });
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
      scrollPos = Math.round(getScrollPos() / 100) * 100;
      if (clonesWidth + scrollPos >= scrollWidth) {
        setScrollPos(clonesWidth + mobileStep);
        disableScroll = true;
      } else if (scrollPos == 0) {
        setScrollPos(scrollWidth - clonesWidth * 2);
        disableScroll = true;
      } else if (scrollPos <= mobileStep) {
        setScrollPos(scrollWidth - clonesWidth * 2 + mobileStep);
        disableScroll = true;
      }
    }
    if (disableScroll) {
      setTimeout(() => {
        disableScroll = false;
      }, 50);
    }
  }

  scroller.addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const middle = rect.width / 2;

    if (clickX > middle) {
      scroller.scrollTo({
        left: scroller.scrollLeft + scroller.children[1].offsetWidth,
        behavior: 'smooth'
      });
    } else {
      scroller.scrollTo({
        left: scroller.scrollLeft - scroller.children[1].offsetWidth,
        behavior: 'smooth'
      });
    }
    isDragging = false;
  });

  if(screen.width >= 768 ) {
      let isScrolling;
      scroller.addEventListener('scroll', e => {
          clearTimeout(isScrolling);
          isScrolling = setTimeout(() => {
            onScrollStop();
          }, 100);
        },
        false
      );

    function onScrollStop() {
      scroller.scrollTo({
        left: scroller.children[0].offsetWidth * Math.round(scroller.scrollLeft / scroller.children[0].offsetWidth),
        behavior: 'smooth'
      });
    };
  }

  scroller.addEventListener('touchstart', onTouchStart, { passive: false });
  scroller.addEventListener('touchmove', onTouchMove, { passive: false });
  scroller.addEventListener('touchend', onTouchEnd, { passive: false });

  let startX, deltaX, currentX, halfOfCard;

  function onTouchStart(event) {
    startX = event.touches[0].pageX;
    deltaX = 0;
    currentX = 0;
    halfOfCard = 0;
  }

  function onTouchMove(event) {
    event.preventDefault();
    isDragging = true;
    currentX = event.touches[0].pageX;
    deltaX = currentX - startX;
    const scrollDelta = currentX - startX > 0 ? -1 : 1;
    halfOfCard = screen.width <= 768 ? (scroller.children[0].offsetWidth/2) * scrollDelta : 0;
    scroller.scrollLeft -= deltaX;
    startX = currentX;
  }

  function onTouchEnd() {
    if (isDragging) {
      scroller.scrollTo({
        left: scroller.children[0].offsetWidth * Math.round(scroller.scrollLeft / scroller.children[0].offsetWidth) +halfOfCard,
        behavior: 'smooth'
      });
      isDragging = false;
    }
  }

  function loop({ target, target: { offsetWidth } }) {
    const checkPos = () => {
      [...target.children].map(e => {
        const toCenter = Math.abs(window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2);
        const toCenter2 = window.outerWidth / 2 - e.getBoundingClientRect().left - e.getBoundingClientRect().width / 2;
        const viewport = toCenter / offsetWidth * 100;
        const viewport2 = toCenter2 / offsetWidth * 100;
        e.style.setProperty('--viewport', viewport);
        e.style.setProperty('--viewport2', viewport2);
      });
    };
    requestAnimationFrame(checkPos);
    scrollUpdate();
  }

  window.loop = loop;
}
