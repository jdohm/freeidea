let topics;

const search = async query => {
    if(!topics){
        return topics = fetch(`./../getTopics/`)
        .then(response => response.json())
        .then(json => json.map(tag => ({id: tag.Name})))
        .catch(_ => []);
    } else return topics;
};

let neededSkill;

const searchSkills = async query => {
    if(!neededSkill){
        return neededSkill = fetch(`./../getSkills/`)
            .then(response => response.json())
            .then(json => json.map(skill => ({id: skill.Name})))
            .catch(_ => []);
    } else return neededSkill;
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

const generateTagAdderChip = _ => {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.classList.add(`chipTagAdder-${_.id}`);
    chip.innerText = _.id;
    return chip;
};

const generateSkillAdderChip = _ => {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.classList.add(`chipSkillAdder-${_.id}`);
    chip.innerText = _.id;
    return chip;
};