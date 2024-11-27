const corelationButton = [...document.querySelectorAll("a[href='#open-modal-corelation']")];

corelationButton.forEach((element) => {
    if (element !== null) {
        element.addEventListener('click', () => {
            MicroModal.show('modal-corelation');
            MicroModal.init();
        });
    }
});

const submitCorelation = document.querySelector("a[href='#submit-modal-corelation']");

if (submitCorelation !== null) {
  submitCorelation.onclick = () => {
    const corelationForm = document.getElementById("corelation-form");
    corelationForm.submit();
  }
}

const testButton = [...document.querySelectorAll("a[href='#open-modal-test']")];

testButton.forEach((element) => {
    if (element !== null) {
        element.addEventListener('click', () => {
            MicroModal.show('modal-test');
            MicroModal.init();
        });
    }
});

const submitTest = document.querySelector("a[href='#submit-modal-test']");
console.log(submitTest);

if (submitTest !== null) {
  submitTest.onclick = () => {
    const testForm = document.getElementById("test-form");
    testForm.submit();
  }
}

const normalizationButton = [...document.querySelectorAll("a[href='#open-modal-normalization']")];

normalizationButton.forEach((element) => {
    if (element !== null) {
        element.addEventListener('click', () => {
            MicroModal.show('modal-normalization');
            MicroModal.init();
        });
    }
});

const submitNormalization = document.querySelector("a[href='#submit-modal-normalization']");

if (submitNormalization !== null) {
  submitNormalization.onclick = () => {
    const normalizationForm = document.getElementById("normalization-form");
    normalizationForm.submit();
  }
}

const registrationButton = [...document.querySelectorAll("a[href='#open-modal-reg']")];

registrationButton.forEach((element) => {
    if (element !== null) {
        element.addEventListener('click', () => {
            MicroModal.show('modal-registration');
            MicroModal.init();
        });
    }
});

const loginButton = [...document.querySelectorAll("a[href='#open-modal-log']")];

loginButton.forEach((element) => {
    if (element !== null) {
        element.addEventListener('click', () => {
            MicroModal.show('modal-login');
            MicroModal.init();
        });
    }
});

///

// test select
// normalization select
let tableElements = Array.from(document.getElementsByName("table"));
const baseTableElements = Array.from(document.getElementsByName("baseTable"));
const corelationTableElements = Array.from(document.getElementsByName("corelationTable"));
tableElements = tableElements.concat(baseTableElements).concat(corelationTableElements);
let columnElements = Array.from(document.getElementsByName("column"));
const baseColumnElements = Array.from(document.getElementsByName("baseColumn"));
const corelationColumnElements = Array.from(document.getElementsByName("corelationColumn"));
columnElements = columnElements.concat(baseColumnElements).concat(corelationColumnElements);

// Початкові значення параметрів
const allOptions = [
  { value: 'Irradiance', text: 'Irradiance' },
  { value: 'Power', text: 'Power' },
  { value: 'Humidity', text: 'Humidity' },
  { value: 'Pressure', text: 'Pressure' },
  { value: 'Temperature', text: 'Temperature' },
];

// Відфільтровані значення для PVGIS API
const pvgisOptions = ['Irradiance', 'Power', 'Temperature'];

const updateParameters = (source, options) => {
  const selectedSource = source.value;
  console.log('smth');
  options.innerHTML = '';

  const optionsToShow =
    selectedSource === 'pvgis_api'
      ? allOptions.filter(option => pvgisOptions.includes(option.value))
      : allOptions;

  optionsToShow.forEach(option => {
    const newOption = document.createElement('option');
    newOption.value = option.value;
    newOption.textContent = option.text;
    options.appendChild(newOption);
  });
}

tableElements.forEach((tag, index) => {
  updateParameters(tag, columnElements[index])
  tag.addEventListener('change', () => updateParameters(tag, columnElements[index]))
});
