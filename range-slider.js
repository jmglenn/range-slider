/*!
 * ==========================================================
 *  RANGE SLIDER 2.0.1
 * ==========================================================
 * Author: Taufik Nurrohman <https://github.com/tovic>
 * License: MIT
 * ----------------------------------------------------------
 */

function RS(target, event, vertical) {

    event = event || {};

    var win = window,
        doc = document,
        ranger = doc.createElement('div'),
        dragger = doc.createElement('span'),
        drag = false,
        rangerSize = 0,
        draggerSize = 0,
	draggerX = 0,
	draggerY = 0,
        rangerDistance = 0,
	lastX=0,
	lastY=0,
        cacheValue = 0,
        vertical = vertical || event.vertical || false,
        size = vertical ? 'offsetHeight' : 'offsetWidth',
        css = vertical ? 'top' : 'left',
        page = vertical ? 'pageY' : 'pageX',
        offset = vertical ? 'offsetTop' : 'offsetLeft',
        client = vertical ? 'clientY' : 'clientX',
        scroll = vertical ? 'scrollTop' : 'scrollLeft',
	drag_start_x = 0,
	drag_start_y = 0;

    function isSet(x) {
        return typeof x !== "undefined";
    }

    function isFunc(x) {
        return typeof x === "function";
    }

    function getCoordinate(el) {
        var x = el[offset];
        while (el = el.offsetParent) {
            x += el[offset];
        }
        return x;
    }

    function on(ev, el, fn) {
        if (el.addEventListener) {
            el.addEventListener(ev, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + ev, fn);
        } else {
            el['on' + ev] = fn;
        }
    }

    function off(ev, el, fn) {
        if (el.removeEventListener) {
            el.removeEventListener(ev, fn);
        } else if (el.detachEvent) {
            el.detachEvent('on' + ev, fn);
        } else {
            el['on' + ev] = null;
        }
    }

    function addClass(s, el) {
        if (el.classList) {
            el.classList.add(s);
        } else {
            el.className += ' ' + s;
        }
    }

    addClass('range-slider', target);
    addClass('range-slider-' + (vertical ? 'vertical' : 'horizontal'), target);
    addClass('range-slider-track', ranger);
    addClass('dragger', dragger);

    // `RS(target, function(a, b, c) {})`
    if (isFunc(event)) {
        event = {
            drag: event
        };
    }

    function edge(a, b, c) {
        if (a < b) return b;
        if (a > c) return c;
        return a;
    }

    function preventDefault(e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    }

    function setSize() {
        rangerSize = ranger[size];
        rangerDistance = getCoordinate(ranger);
        draggerSize = dragger[size];
    }

    function dragInit() {
        cacheValue = edge(isSet(event.value) ? event.value : 0, 0, 100);
        dragger.style[css] = (((cacheValue / 100) * rangerSize) - (draggerSize / 2)) + 'px';
        if (isFunc(event.create)) event.create(cacheValue, target);
        if (isFunc(event.drag)) event.drag(cacheValue, target);
    }

    function dragStart(e) {
	cur_x=draggerX=drag_start_x=(e.clientX-target.offsetLeft);
	draggerY=drag_start_y=e.clientY;
        setSize(), drag = true, dragUpdate(e);
        on("touchmove", doc, dragMove);
        on("mousemove", doc, dragMove);
        if (isFunc(event.start)) event.start(cacheValue, target, e);
        return preventDefault(e);
    }

    function dragMove(e) {
        dragUpdate(e);
        return preventDefault(e);
    }

    function dragStop(e) {
        drag = false;
        off("touchmove", doc, dragMove);
        off("mousemove", doc, dragMove);
        if (isFunc(event.stop)) event.stop(cacheValue, target, e);
        return preventDefault(e);
    }
    var attenuation_val=1080.0;


    var last_x = 0, cur_x = 0;
    var attenuated=false;
    var attenuation_threshold=20;
    function dragUpdate(e) {
	//Figure out
	cur_x=e.clientX;
	let total_dist = cur_x - drag_start_x;
	let dist = cur_x - last_x;
	let y_dist = Math.abs(e.clientY-target.offsetTop);
	let move_speed = 1;
	if(y_dist > attenuation_threshold && !attenuated){
		attenuated=true;
		drag_start_x=cur_x;
	} else if (y_dist<attenuation_threshold && attenuated) {
		attenuated = false;
	}
	if(y_dist > attenuation_threshold && attenuated){
		move_speed=Math.pow(10/Math.log10(y_dist)/10,2);
	}
	//move_speed=Math.pow(10/Math.log10(y_dist)/10,2);
//	let move_speed = y_dist < 10?1:Math.log10(Math.abs(attenuation_val- (e.clientY-target.offsetTop)))/10;
	let move_dist = dist*move_speed;
	draggerX+=move_dist;//(new_pos - (draggerSize / 2));

	let pos = e.touches ? e.touches[0][page] : e[page];
	let new_pos = (e.clientX-target.offsetLeft-drag_start_x)*move_speed;
	//console.log("Move by:",move_dist);	
	console.log("movement speed:",move_speed);
        e = e || win.event;
        var move = edge(pos - rangerDistance, 0, rangerSize)*move_speed,
            value = edge((((drag_start_x-target.offsetLeft + total_dist*move_speed)) / rangerSize) * 100, 0, 100);
        if (!pos) pos = e[client] + doc.body[scroll] + doc.documentElement[scroll];
        if (drag) {
            dragger.style[css] = (drag_start_x-target.offsetLeft + total_dist*move_speed) + 'px';
            cacheValue = Math.round(value);
            if (isFunc(event.drag)) event.drag(cacheValue, target, e);
        }
	last_x = cur_x;
    }

    on("touchstart", ranger, dragStart);
    on("mousedown", ranger, dragStart);

    on("touchend", doc, dragStop);
    on("mouseup", doc, dragStop);

    on("resize", win, function(e) {
        setSize(), drag = false;
        dragger.style[css] = (((cacheValue / 100) * rangerSize) - (draggerSize / 2)) + 'px';
    });

    ranger.appendChild(dragger);
    target.appendChild(ranger);

    return setSize(), dragInit(), target;

}
