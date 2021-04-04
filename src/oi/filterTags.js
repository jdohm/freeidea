/**
 * @fileOverview file which initiates the autocomplete.js to offer tag support
 * for filtering/adding tags to ideas
 * @name filterTags.js
 * @author Jannis Dohm
 * @license MIT
 * this work is heavily based on the work of Sami Jnih  https://github.com/samijnih
 * his work can be found here: https://github.com/TarekRaafat/autoComplete.js/issues/91#issuecomment-747089915
 */

//adds function to the filter icon
document.getElementById('filterMain').onsubmit = function () {
    document.getElementById('tag_query').style.width = "0";
    document.getElementById('tag_query').style.borderLeft = "0px solid #9e9e9e";
    document.getElementById('tag_query').style.borderTop = "0px solid #9e9e9e";
    document.getElementById('tag_query').style.borderBottom = "0px solid #9e9e9e";
    return false;
};
document.getElementById('filterMain').addEventListener('click', () => {
    document.getElementById('tag_query').style.width = "calc(100% - 49px)";
    document.getElementById('tag_query').style.borderLeft = "3px solid #9e9e9e";
    document.getElementById('tag_query').style.borderTop = "3px solid #9e9e9e";
    document.getElementById('tag_query').style.borderBottom = "3px solid #9e9e9e";
    /* document.getElementById('testT').style.display = "inline-block";
    * document.getElementById('testT').style.transform = "scale(1)"; */
});
document.getElementById('filterMain').addEventListener('focusout', () => {
    document.getElementById('tag_query').style.width = "0px";
    document.getElementById('tag_query').style.borderLeft = "0px solid #9e9e9e";
    document.getElementById('tag_query').style.borderTop = "0px solid #9e9e9e";
    document.getElementById('tag_query').style.borderBottom = "0px solid #9e9e9e";
    /* document.getElementById('testT').style.transform = "scale(0)"; */
    /* document.getElementById('testT').style.display = "none"; */
});


const generateFilterIcon = _ => {
  const i = document.createElement('i');
  i.addEventListener('click', () => {
    Array.from(document.getElementById('tag').options).forEach(option => {
      if (option.dataset.id === _.id) {
          //remove tag from filterstring
          filterArray = filterArray.filter(item => item !== _.id);
          //redraw hide/show ideas according to new filter set
          DrawIdeas.filterIdeas(window.p, filterArray);
        option.remove();
        document.querySelector(`.chip-${_.id}`).remove();
      }
    });
  });
  i.classList.add('close');
  i.classList.add('material-icons');
  i.innerText = 'close';
  return i;
};

var filterArray = [];

new autoComplete({
  noResults: (dataFeedback, generateList) => {
    document.querySelector('.tag-collection').classList.remove('hide');
  },
  data: {
      src: async () => search(document.getElementById('tag_query').value),
    key: ['id'],
    cache: false,
  },
  query: {
    manipulate: (query) => {
      document.querySelector('.tag-collection').classList.add('hide');

      return query;
    }
  },
  onSelection: feedback => {
    let stringT = feedback.selection.value;
    //Capitalize and remove Whitespaces in topics
    stringT.id = stringT.id.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).replace(/\s+/g, '');

    //generate chipt and display it
    const chip = generateChip(stringT);
    chip.appendChild(generateFilterIcon(stringT));
      document.getElementById('tag_chips').appendChild(chip);
      document.getElementById('tag').add(generateOption(stringT));
      filterArray.push(stringT.id);
      DrawIdeas.filterIdeas(window.p, filterArray);
      console.log("filtering for: " + filterArray);

      document.getElementById('tag_query').value = '';
  },
  resultsList: {
    render: true,
    container: source => {
      source.classList.add('tag-collection');
    },
    destination: "#tag_collection-wrapper",
    position: "beforeend",
    element: "ul"
  },
  highlight: true,
  trigger: query => query.length > 0,
  maxResults: 5,
  threshold: 1,
  debounce: 500,
  placeHolder: "Filter for topic",
  selector: "#tag_query",
});
