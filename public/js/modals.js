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


