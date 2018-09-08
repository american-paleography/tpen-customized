$(function() {
	var ui = {};
	ui.canvas = $('#ui-overlay')[0];
	ui.ctx = ui.canvas.getContext('2d');
	ui.points = [];

	var buffer = {};
	buffer.canvas = $(/*'<canvas>'*/ '#buffer')[0];
	buffer.canvas.width = ui.canvas.width;
	buffer.canvas.height = ui.canvas.height;
	buffer.ctx = buffer.canvas.getContext('2d');

	var bg = {};
	bg.canvas = $('#bg-canvas')[0];
	bg.ctx = bg.canvas.getContext('2d');

	var output = {};
	output.canvas = $('#output-canvas')[0];
	output.ctx = output.canvas.getContext('2d');

	ui.canvas.addEventListener('mousedown', ev => addPoint(eventToPoint(ev)));
	ui.canvas.addEventListener('touchstart', ev => addPoint(eventToPoint(ev)));

	var img = new Image();
	img.onload = function() {
		bg.ctx.drawImage(this, 0, 0);
	}
	img.src = "/images/trexhead.png";

	function eventToPoint(ev) {
		console.log(ev);
		return [
			ev.offsetX,
			ev.offsetY,
		];
	}

	function addPoint(p) {
		ui.points.push(p);
		drawPolygon();
		cutPolygon();
	}

	function drawPolygon() {
		ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);

		ui.ctx.beginPath()
		ui.ctx.moveTo(...ui.points[ui.points.length-1]);
		ui.points.forEach(point => {
			ui.ctx.lineTo(...point);
		});

		ui.ctx.stroke();
	}

	function cutPolygon() {
		var rect = getBoundingBox(ui.points);

		buffer.ctx = buffer.canvas.getContext('2d');
		buffer.ctx.globalCompositeOperation = 'source-over';

		buffer.ctx.putImageData(bg.ctx.getImageData(...rect), rect[0], rect[1]);

		buffer.ctx.globalCompositeOperation = 'destination-in';
		buffer.ctx.beginPath();
		buffer.ctx.moveTo(...ui.points[ui.points.length-1]);
		ui.points.forEach(point => {
			buffer.ctx.lineTo(...point);
		})

		buffer.ctx.fill();

		var clipped = buffer.ctx.getImageData(...rect);

		output.canvas.width = clipped.width;
		output.canvas.height = clipped.height;

		output.ctx.putImageData(clipped, 0, 0);
	}

	function getBoundingBox(points) {
		var x = points.map(a => a[0]).sort((a,b) => a-b); // um, why is the default sort string-y?
		var y = points.map(a => a[1]).sort((a,b) => a-b);
		console.log(points, x, y);
		var left = x[0];
		var top = y[0];
		
		var width = x[x.length-1] - left;
		var height = y[y.length-1] - top;

		return [left, top, width, height];
	}
});
