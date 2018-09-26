function prepExporter(project) {
	var manifest = JSON.parse(project.manifest);

	$('#prep-download').text('Apply settings');
	$('#prep-download').attr('disabled', null);

	window.EXPORT_DATA = extractLines(manifest.sequences[0]);



	function extractLines(sequence) {
		var files = [];
		sequence.canvases.forEach(canvas => {
			var fileText = [];
			canvas.otherContent.forEach(other => {
				other.resources.forEach(wrapper => {
					var resource = wrapper.resource;
					if (resource["@type"] == "cnt:ContentAsText") {
						var line = resource['cnt:chars'] || '';
						fileText.push(line);
					}
				});
			})
			if (!canvas.otherContent.length) {
				return;
			}
			files.push({
				name: canvas.otherContent[0].resources[0].on.match(/\/([^\/#]+)#/)[1],
				text: fileText,
			});
		})
		return files;
	}
}

$(function() {
	function formatText(file) {
		var includeLineNumbers = $('[name=line-num]').is(':checked');
		var lines = file.text;
		if (includeLineNumbers) {
			lines = lines.map((line, i) => `${i+1}: ${line}`);
		}

		var text = file.name + "\n\n" + lines.join("\n");
		return text;
	}

	$('#prep-download').on('click', function() {
		var separator = $('[name=page-separator]').val();
		var filename = $('[name=download-filename]').val() + ".txt";
		var text = EXPORT_DATA.map(file => formatText(file)).join("\n" + separator + "\n");

		$("#download-transcript").attr('download', filename);
		$("#download-transcript").attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	})
});
