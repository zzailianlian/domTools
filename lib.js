
// 根据.xx #xx xx 或dom 来获取dom元素
export function getDomElement(domstr) {
  let dom = null;
  if (domstr instanceof HTMLElement) {
    dom = domstr;
  } else {
    dom = document.querySelector(domstr);
    // ||
    // document.querySelector(`.${domstr}`) ||
    // document.querySelector(`#${domstr}`);
  }
  return dom;
};

// 是否移动到屏幕中
export function isScrollIntoView(target, scrollContainter) {
  // const scrollEl = this.getDomElement(scrollContainter || document.body);
  const targetEl = this.getDomElement(target);
  if (targetEl) {
    const wH = Math.min(window.innerHeight, window.outerHeight);
    const sH =
      document.body.scrollTop || document.documentElement.scrollTop;
    const targetRect = this.getRectFromView(targetEl);
    const currentViewRect = {
      bottom: sH + wH,
      top: sH,
    };
    if (
      (targetRect.top >= currentViewRect.top &&
        targetRect.top <= currentViewRect.bottom) ||
      (targetRect.bottom >= currentViewRect.top &&
        targetRect.bottom <= currentViewRect.bottom)
    ) {
      return true;
    }
  }
  return false;
};
// 获取dom的相对于页面左上角的相关位置信息
export function getRectFromView(domstr) {
  const dom = this.getDomElement(domstr);
  if (dom) {
    const _getRect = (curDom) => {
      let rect = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: curDom.offsetHeight,
        width: curDom.offsetWidth,
        el: curDom,
      };
      const getOffsetParentRect = (newDom) => {
        if (newDom && newDom instanceof HTMLElement) {
          rect = {
            ...rect,
            top: rect.top + newDom.offsetTop,
            bottom: rect.top + newDom.offsetTop + curDom.offsetHeight,
            left: rect.left + newDom.offsetLeft,
            right: rect.left + newDom.offsetLeft + curDom.offsetWidth,
          };
          if (newDom.offsetParent) {
            return getOffsetParentRect(newDom.offsetParent);
          }
        }
        return rect;
      };

      return getOffsetParentRect(curDom);
    };
    return _getRect(dom);
  }
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    width: 0,
    el: null,
  };
}



/**
 * 监听dom滑动时 鼠标上下左右移动，并触发相应事件
 * @param {HTMLElement} options.el dom元素
 * @param {Boolean} options.once 为true则只在初始时触发或改变方向时触发options.Function
 * @param {Function} options.moveLeft moveLeft
 * @param {Function} options.moveRight moveRight
 * @param {Function} options.moveTop moveTop
 * @param {Function} options.moveBottom moveBottom
 * @returns 
 */
export function mouseMoveObsever(options) {

  const { el, moveLeft, moveRight, moveTop, moveBottom, once } = {
    el: null,
    moveLeft: () => { },
    moveRight: () => { },
    moveTop: () => { },
    moveBottom: () => { },
    once: true,
    ...options,
    el: getDomElement(options.el)
  }
  if (!(el instanceof HTMLElement)) return console.error('el不是HTMLElement类型');
  let startX, startY, moveEndX, moveEndY, X, Y, flag, direction;
  function touchstartHandle(e) {
    once && (flag = true)
    // e.preventDefault();
    startX = e.changedTouches[0].pageX,
      startY = e.changedTouches[0].pageY;
  }
  function changeFlagWithDirection(newDirection) {
    if (direction !== newDirection) {
      once && (flag = true)
    }
  }
  function touchmoveHandle(e) {
    // e.preventDefault();

    moveEndX = e.changedTouches[0].pageX,
      moveEndY = e.changedTouches[0].pageY,
      X = moveEndX - startX,
      Y = moveEndY - startY;
    startX = moveEndX;
    startY = moveEndY;

    if (X > 0) {
      changeFlagWithDirection('right')
      direction = 'right'
      flag && moveRight instanceof Function && moveRight();
    }
    else if (X < 0) {
      changeFlagWithDirection('left')
      direction = 'left'
      flag && moveLeft instanceof Function && moveLeft();
    }
    else if (Y > 0) {
      changeFlagWithDirection('top')
      direction = 'top'
      moveTop instanceof Function && moveTop();
    }
    else if (Y < 0) {
      changeFlagWithDirection('bottom')
      direction = 'bottom'
      moveBottom instanceof Function && moveBottom();
    }
    else {
      console.log("anything else");
    }
    once && (flag = false);
  }
  return {
    register() {
      el.addEventListener("touchstart", touchstartHandle)
      el.addEventListener("touchmove", touchmoveHandle)
    },
    destroy() {
      el.removeEventListener("touchstart", touchstartHandle)
      el.removeEventListener("touchmove", touchmoveHandle)
    }
  }
}

export default {
  getDomElement,
  getRectFromView,
  isScrollIntoView
}