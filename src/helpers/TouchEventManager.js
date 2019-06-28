import core from 'core';
import { isIOS } from 'helpers/device';
import getNumberOfPagesToNavigate from 'helpers/getNumberOfPagesToNavigate';
import { getMinZoomLevel, getMaxZoomLevel } from 'constants/zoomFactors';
import { getDataWithKey, mapToolNameToKey } from 'constants/map';

const TouchEventManager = {
  initialize(document, container) {
    this.document = document;
    this.container = container;
    this.allowHorizontalSwipe = true;
    this.allowVerticalSwipe = false;
    this.verticalMomentum = 0;
    this.horziontalMomentum = 0;
    this.verticalLock = false;
    this.horziontalLock = false;
    this.startingScrollLeft = null;
    this.startingScrollTop = null;
    this.containerWidth = 0;
    this.documentWidth = 0;
    this.lockTimeout = null;
    this.touch = {
      clientX: 0,
      clientY: 0,
      distance: 0,
      horizontalDistance: 0,
      verticalDistance: 0,
      scale: 1,
      zoom: 1,
      type: ''
    };
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.container.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
  },

  updateOrientation(newOrientation) {
    if (newOrientation === 'both') {
      this.allowVerticalSwipe = true;
      this.allowHorizontalSwipe = true;
    } else if (newOrientation === 'vertical') {
      this.allowVerticalSwipe = true;
      this.allowHorizontalSwipe = false;
    } else if (newOrientation === 'horizontal') {
      this.allowVerticalSwipe = false;
      this.allowHorizontalSwipe = true;
    } else {
      console.warn(`${newOrientation} is not a valid orientation. Try 'vertical,' 'horizontal,' or 'both.`);
      return;
    }
  },

  terminate() {
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    this.container.removeEventListener('touchcancel', this.handleTouchCancel);
  },
  handleTouchStart(e) {
    switch (e.touches.length) {
      case 1: {
        const touch = e.touches[0];
        const scrollWidth = this.container.clientWidth;
        const viewerWidth = this.document.clientWidth;
        const isDoubleTap = this.touch.type === 'tap' && this.getDistance(this.touch, touch) <= 10;
        this.startingScrollLeft = this.container.scrollLeft;
        this.startingScrollTop = this.container.scrollTop;
        this.containerWidth = document.querySelector('.DocumentContainer').clientWidth;
        this.documentWidth = document.querySelector('.document').clientWidth;
        this.touch = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          distance: 0,
          scale: scrollWidth / viewerWidth,
          zoom: core.getZoom(),
          type: isDoubleTap ? 'doubleTap' : 'tap',
          touchStartTimeStamp: Date.now(),
          stopMomentumScroll: true,
          touchCount: 0,
        };
        clearTimeout(this.lockTimeout);
        clearTimeout(this.doubleTapTimeout);
        break;
      }
      case 2: {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const clientX = (t1.clientX + t2.clientX) / 2;
        const clientY = (t1.clientY + t2.clientY) / 2;
        const docX = clientX - this.document.offsetLeft + this.container.scrollLeft;
        const docY = clientY - this.document.offsetTop + this.container.scrollTop;
        this.touch = {
          marginLeft: this.document.offsetLeft,
          marginTop: parseFloat(window.getComputedStyle(this.document).marginTop),
          clientX,
          clientY,
          docX,
          docY,
          distance: this.getDistance(t1, t2),
          scale: 1,
          zoom: core.getZoom(),
          type: 'pinch',
          touchStartTimeStamp: Date.now(),
          stopMomentumScroll: true
        };
        if (!isIOS) {
          this.document.style.transformOrigin = `${docX}px ${docY}px`;
        }
        break;
      }
    }
  },
  isScrollingVertically(lockRatio = 3) {
    return (Math.abs(this.verticalMomentum) > 1 && this.horziontalMomentum === 0) || (Math.abs(this.touch.verticalDistance) > lockRatio * Math.abs(this.touch.horizontalDistance));
  },
  isScrollingHorziontally(lockRatio = 3) {
    return (Math.abs(this.horziontalMomentum) > 1 && this.verticalMomentum === 0) || (Math.abs(this.touch.horizontalDistance) > lockRatio * Math.abs(this.touch.verticalDistance));
  },
  isScrollLockingDisabled() {
    // using 'touchCount' to disable scroll locking when user is dragging
    return this.touch.touchCount > 6 || this.verticalLock || this.horziontalLock;
  },
  handleTouchMove(e) {
    e.preventDefault();
    
    switch (e.touches.length) {
      case 1: {
        const t = e.touches[0];
        const doesPagesFitOnScreen = this.documentWidth < this.containerWidth;  
        this.touch.horizontalDistance = this.touch.clientX - t.clientX;
        this.touch.verticalDistance = this.touch.clientY - t.clientY;

        if (!doesPagesFitOnScreen && !this.isScrollLockingDisabled()) {  
          if (!this.horziontalLock && this.isScrollingVertically() ) {
            this.verticalLock = true;
          } else if (!this.verticalLock && this.isScrollingHorziontally()) {
            this.horziontalLock = true;
          } 
        }

        if (this.getDistance(this.touch, t) > 10) {
          this.touch.type = 'swipe';
        }

        if (this.verticalLock) {
          // undo horizontal scrolling caused by native touch when scrolling is disabled
          this.container.scrollTo(this.startingScrollLeft, this.container.scrollTop);
          // set 'horizontalDistance' to '0' to get rid of horiztonal momentum in 'handleTouchEnd'
          this.touch.horizontalDistance = 0; 
        }

        if (this.horziontalLock) {
          this.container.scrollTo(this.container.scrollLeft, this.startingScrollTop);
          this.touch.verticalDistance = 0; 
        }

        this.touch.touchCount++;
        break;
      }
      case 2: {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.touch.scale = this.getDistance(t1, t2) / this.touch.distance;

        if (this.touch.scale * this.touch.zoom < getMinZoomLevel()) {
          this.touch.scale = getMinZoomLevel() / this.touch.zoom;
        } else if (this.touch.scale * this.touch.zoom > getMaxZoomLevel()) {
          this.touch.scale = getMaxZoomLevel() / this.touch.zoom;
        }

        if (isIOS) {
          const marginLeft = (this.touch.marginLeft + (1 - this.touch.scale) * this.touch.docX) / this.touch.scale;
          const marginTop = (this.touch.marginTop + (1 - this.touch.scale) * this.touch.docY) / this.touch.scale;
          this.document.style.marginLeft = `${marginLeft}px`;
          this.document.style.marginTop = `${marginTop}px`;
          this.document.style.zoom = this.touch.scale;
        } else {
          this.document.style.transform = `scale(${this.touch.scale})`;
        }
        break;
      }
    }
  },
  handleTouchEnd() {
    switch (this.touch.type) {
      case 'tap': {
        this.doubleTapTimeout = setTimeout(() => {
          this.horziontalLock = false;
          this.verticalLock = false;
          this.touch.type = ''; 
        }, 300);
        break;
      }
      case 'swipe': {
        if (
          this.isUsingAnnotationTools() ||
          core.getSelectedText().length || 
          core.getSelectedAnnotations().length
        ) {
          return;
        }

        const { reachedLeft, reachedTop, reachedRight, reachedBottom } = this.reachedBoundary();
        const threshold = 0.35 * this.container.clientWidth;
        const swipedToBottom = reachedBottom && this.touch.verticalDistance > threshold;
        const swipedToTop = reachedTop && this.touch.verticalDistance < -threshold;
        const swipedToRight = reachedRight && this.touch.horizontalDistance > threshold;
        const swipedToLeft = reachedLeft && this.touch.horizontalDistance < -threshold;

        const currentPage = core.getCurrentPage();
        const totalPages = core.getTotalPages();
        const displayMode = core.getDisplayMode();
        const numberOfPagesToNavigate = getNumberOfPagesToNavigate(displayMode);
        
        const isFirstPage = currentPage === 1;
        const isLastPage = currentPage === totalPages;    
        const isSingleDisplayMode = !core.isContinuousDisplayMode(); 
        const shouldGoToPrevPage = isSingleDisplayMode && !isFirstPage && ((swipedToLeft && this.allowHorizontalSwipe) || (swipedToTop && this.allowVerticalSwipe));
        const shouldGoToNextPage = isSingleDisplayMode && !isLastPage && ((swipedToRight && this.allowHorizontalSwipe) || (swipedToBottom && this.allowVerticalSwipe));

        if (shouldGoToPrevPage) {
          core.setCurrentPage(Math.max(1, currentPage - numberOfPagesToNavigate));
        } else if (shouldGoToNextPage) {
          core.setCurrentPage(Math.min(totalPages, currentPage + numberOfPagesToNavigate));
        } else {
          const millisecondsToSeconds = 1000;
          const touchDuration = (Date.now() - this.touch.touchStartTimeStamp) / millisecondsToSeconds;
          
          if (touchDuration < 0.2) {
            this.touch.stopMomentumScroll = false;
            this.startMomentumScroll(touchDuration);
          } else {
            this.lockTimeout = setTimeout(() => {
              // use timeout for unlocking lock to keep it locked if user is rapidly swipping in one direction
              this.horziontalLock = false;
              this.verticalLock = false;
            }, 300);
          }
        }
        break;
      }
      case 'doubleTap': {
        if (this.isUsingAnnotationTools()) {
          const tool = core.getToolMode();
          tool.finish && tool.finish();
        } else {
          if (this.oldZoom) {
            this.touch.scale = Math.max(this.oldZoom / this.touch.zoom, getMinZoomLevel() / this.touch.zoom);
            this.oldZoom = null;
          } else {
            this.touch.scale = Math.min(3, getMaxZoomLevel() / this.touch.zoom);
            this.oldZoom = this.touch.zoom;
          }
          const zoom = core.getZoom() * this.touch.scale;
          const { x, y } = this.getPointAfterScale(); 
          core.zoomTo(zoom, x, y);
        }
        break;
      }
      case 'pinch': {
        if (isIOS) {
          this.document.style.zoom = 1;
          this.document.style.margin = 'auto';
        } else {
          this.document.style.transform = 'none';
        }
        const zoom = core.getZoom() * this.touch.scale;
        const { x, y } = this.getPointAfterScale(); 
        core.zoomTo(zoom, x, y);
        break;
      }
    }
    this.touch.touchCount = 0;
    // Need to preserve the previous momentum values during 'TouchMove' event. So clear their values in 'touchEnd'
    this.verticalMomentum = 0;
    this.horziontalMomentum = 0;
  },
  handleTouchCancel(e) {
    this.handleTouchEnd(e);
  },
  startMomentumScroll(touchDuration) {
    let currentIteration = 0;
    const iterationsCount = 70;
    const initScrollLeft = this.container.scrollLeft;
    const initScrollTop = this.container.scrollTop;
    const dHorizontal = this.touch.horizontalDistance / touchDuration / 1.85;
    const dVertical = this.touch.verticalDistance / touchDuration / 1.85;
    const momentumScroll = () => {
      let nextLeft = this.easeOutQuad(currentIteration, initScrollLeft, dHorizontal, iterationsCount);
      let nextTop = this.easeOutQuad(currentIteration, initScrollTop, dVertical, iterationsCount);
      this.container.scrollLeft = nextLeft;
      this.container.scrollTop = nextTop;
      this.verticalMomentum = dVertical;
      this.horziontalMomentum = dHorizontal;   
      
      let isNotTouchEvent =  !this.touch.touchCount;
      let isScrollingAlmostFinish = (Math.abs(this.container.scrollLeft - nextLeft) < 1 || Math.abs(this.container.scrollTop - nextTop) < 1);

      if (isNotTouchEvent && isScrollingAlmostFinish) {
        // disable lock when scrolling is mostly done and not in the middle of another touch event
        this.horziontalLock = false;
        this.verticalLock = false;
      }

      if (currentIteration < iterationsCount && !this.touch.stopMomentumScroll) {
        currentIteration++;
        requestAnimationFrame(momentumScroll);
      }
    }; 
    
    requestAnimationFrame(momentumScroll);
  },
  easeOutQuad(currentTime, startValue, changeInValue, duration) {
    // http://gizma.com/easing/#quad2
    currentTime /= duration;

    return -changeInValue * currentTime * (currentTime - 2) + startValue;
  },
  reachedBoundary() {
    const { clientHeight: scrollHeight, clientWidth: scrollWidth, scrollLeft, scrollTop } = this.container;
    const { clientHeight: viewerHeight, clientWidth: viewerWidth } = this.document;

    return {
      reachedLeft: scrollLeft <= 0,
      reachedTop: scrollTop <= 0,
      reachedBottom: scrollHeight + scrollTop >= viewerHeight,
      reachedRight: scrollWidth + scrollLeft >= viewerWidth
    };
  },
  getDistance(t1, t2) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  },
  getPointAfterScale() {
    const x = (this.touch.clientX + this.container.scrollLeft - this.document.offsetLeft) * this.touch.scale - this.touch.clientX + this.container.offsetLeft;
    const y = (this.touch.clientY + this.container.scrollTop - this.document.offsetTop) * this.touch.scale - this.touch.clientY + this.container.offsetTop;

    return { x, y };
  },
  isUsingAnnotationTools() {
    const tool = core.getToolMode();
    
    return getDataWithKey(mapToolNameToKey(tool.name)).annotationCheck;
  }
};

export default Object.create(TouchEventManager);

