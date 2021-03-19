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


let topics;

const search = async query => {
    if(!topics){
        return topics = fetch(`./../getTopics/`)
        .then(response => response.json())
        .then(json => json.map(country => ({id: country.Name})))
        .catch(_ => []);
    } else return topics;
};

const generateOption = _ => {
  const option = document.createElement('option');
  option.value = _.id;
    option.dataset.id = _.id;
  return option;
};

const generateChip = _ => {
  const chip = document.createElement('div');
  chip.classList.add('chip');
    chip.classList.add(`chip-${_.id}`);
  chip.innerText = _.id;
  return chip;
};

const generateIcon = _ => {
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

const tag = document.getElementById('tag');
const input = document.getElementById('tag_query');
const chips = document.getElementById('tag_chips');
var filterArray = [];

new autoComplete({
  noResults: (dataFeedback, generateList) => {
    document.querySelector('.tag-collection').classList.remove('hide');
  },
  data: {
    src: async () => search(input.value),
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
    chip.appendChild(generateIcon(stringT));
    chips.appendChild(chip);
    tag.add(generateOption(stringT));
      filterArray.push(stringT.id);
      DrawIdeas.filterIdeas(window.p, filterArray);
      console.log(filterArray);

    input.value = '';
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
