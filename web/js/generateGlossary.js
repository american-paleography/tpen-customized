function reloadGlossaryData(manifest) {
	// data used by various parts of this closure
	annotationData = {
		lines: [],
		pages: [],
		words: {},
	};


	// kick off the actual work
	manifest.sequences.forEach(extractLines);
	showGlossary();


	// various workhorse functions below 

	function showGlossary() {
		var splitHeight = window.innerHeight + "px";
		$('.wordOccurrencesList').css('height', splitHeight);
		var dict = annotationData.words;
		var mainList = $('#glossaryDiv');
		Object.keys(dict).sort().filter(x => x).forEach(word => {
			var data = dict[word];
			var item = $('<li>');
			var keyword = $('<strong>');
			keyword.text(word);
			item.append(keyword);

			if (data.length == 1) {
				var separator = $('<span>');
				separator.text(": ");
				item.append(separator);
				markupWordOccurrence(item, word, data[0]);
			} else {
				var sublist = $('<ul>');
				data.forEach(line => {
					var subitem = $('<li>');
					markupWordOccurrence(subitem, word, line);
					sublist.append(subitem);
				})
				item.append(sublist);
			}
			mainList.append(item);
		});

		function markupWordOccurrence(container, word, data) {
			var start = data.word_offset;
			var end = data.word_offset + word.length;

			var pre = $('<span>');
			pre.text(data.line_text.substring(0, start));

			var ul = $('<span style="text-decoration: underline;">');
			ul.text(data.line_text.substring(start, end));

			var post = $('<span>');
			post.text(data.line_text.substring(end));

			container.append(pre);
			container.append(ul);
			container.append(post);
		}

		var jsonVersion = JSON.stringify(dict, null, '  ')
		var csvVersion = generateCSV(dict);
		$('a#download-json').attr('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonVersion))
		$('a#download-csv').attr('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvVersion))
		$('#debug').text(csvVersion);
	}

	function generateCSV(words) {
		var header = 'row_num,word,line_text,word_offset,line_index_in_page,page_index';
		var csv_lines = [header];
		var count = 0;
		for (var word in words) {
			words[word].forEach(data => {
				count += 1;
				csv_lines.push([
					count,
					word,
					data.line_text,
					data.word_offset,
					data.line_index_in_page,
					data.page_index,
				].map(x => `"${x}"`))
			});
		}

		return csv_lines.join("\n");
	}


	function extractLines(sequence) {
		var page_id = 0;
		sequence.canvases.forEach(canvas => {
			var pageText = [];
			var currentLineIndex = annotationData.lines.length;
			canvas.otherContent.forEach(other => {
				other.resources.forEach(wrapper => {
					var resource = wrapper.resource;
					if (resource["@type"] == "cnt:ContentAsText") {
						var line = resource['cnt:chars'] || '';
						annotationData.lines.push(line);
						pageText.push(line);
						addWords(line, annotationData.lines.length-1, page_id, currentLineIndex);
					}
				});
			})
			annotationData.pages.push(pageText.join("\n"));
			page_id += 1;
		})
	}

	function addWords(line, lookupIndex, pageIndex, pageStartLine) {
		var words = line.split(/\s+/);
		var pos = 0;
		words.forEach(word => {
			var offset = word.length + 1;
			var dict = annotationData.words;
			word = word.replace(/\W/g, ''); // strip punctuation
			word = word.toLowerCase(); // normalize case (might want to do this as an optional thing)
			if (!word) {
				// don't include any empty words
				return;
			}
			if (!dict[word]) {
				dict[word] = [];
			}
			dict[word].push({
				line_index: lookupIndex,
				line_text: line,
				word_offset: pos,
				page_index: pageIndex,
				line_index_in_page: lookupIndex - pageStartLine,
			});

			pos += offset;
		});
	}
}

/*
$(function() {
	// WHY isn't this built-in. Anyway, strip off the '?', then get the right parameter
	var projectId = location.search.substring(1).split("&").map(comp => comp.split("=")).filter(comp => comp[0] == 'projectID')[0][1];
	$.get('/getProjectTPENServlet?projectID=' + projectId, function(payload) {
		reloadGlossaryData(JSON.parse(payload.manifest));
	});

});
*/
