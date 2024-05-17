

function Validator(options) {

    function getParent (inputElement,selector) {
        while (inputElement.parentElement){
            if(inputElement.parentElement.matches(selector)){
                return inputElement.parentElement;
            }else {
                inputElement = inputElement.parentElement;
            }
        }
    }


    var selectorRules = {};

    function  inputValid(inputElement, errorElement) {
        errorElement.innerText = '';
        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
    }
    // xử lí 
    function validate(inputElement ,rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        // console.log(errorMessage);
        var errorMessage ;
        var rules = selectorRules[rule.selector];
        for(let i=0; i< rules.length; i++) { 
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector+ ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    break;
            }
            if(errorMessage) break;
        }
        if(errorMessage) {
            // console.log(errorElement);
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');

        }else {
            inputValid(inputElement,errorElement);
        }
        return !errorMessage;
       
    }

    var formElement = document.querySelector(options.form);
    // console.log(formElement);
    // console.log(options.rules);

    // Lap qua các rules
    if(formElement){
        //  khi submit form  
        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if(!isValid) {
                    isFormValid = false;
                }else isFormValid = true;
    
            });
            if(isFormValid) {
                // submit with js
                if(typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInput).reduce((results , input) => {
                        switch(input.type) {
                            case 'radio':
                                if(input.matches(':checked')) {
                                    results[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    results[input.name] = [];
                                    return results;
                                }
                                if(!Array.isArray( results[input.name])) {
                                    results[input.name] = [];
                                }
                                results[input.name].push(input.value);
                                break;
                            case 'file':
                                results[input.name] = input.files;
                                break;
                            default:
                                results[input.name] = input.value;
                                break;
                        }
                        return results;
                    },{});
                    options.onSubmit(formValues);
                }
                else {
                // submit default 
                formElement.submit();
            }
            }
        }
        options.rules.forEach( (rule) => {

            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);

            }else {
                selectorRules[rule.selector] =[rule.test];
            }
            
            // console.log(rule.selector);
            var inputElements = formElement.querySelectorAll(rule.selector);
            // console.log(inputElement);
            Array.from(inputElements).forEach((inputElement) => {
                 // xử lý trường hợp blur ra khỏi input 
                inputElement.onblur = () => {
                    // console.log(inputElement.value);
                    // console.log(rule.test); 
                    validate(inputElement, rule)
                }
                // xử lý khi người dùng nhập ở input 
                inputElement.oninput = () => { 
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    inputValid(inputElement,errorElement);
                }
            });
            
        });
        console.log(selectorRules);
    }
}

// Định nghĩa các rules
// Nguyên tắc của các rule 
// 1 .có lỗi => message error 
// 2.k có lỗi =>k lj 
Validator.isRequired = (selector,message) => {
    return{
        selector: selector,
        test: function(value) {
            return value  ? undefined : message || "Vui lòng nhập trường này " ;
        }
    }
}

// // ES6 
// Validator.isRequired = (selector) => ({
//     selector,
//     test: (value) => value.trim()!== ''
// })
Validator.isEmail = (selector , message) => ({
    selector,
    test: (value) => {
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return regex.test(value) ? undefined : message ||  "Vui lòng nhập email hợp lệ ";

    }
})

Validator.isPassword = (selector , message) => ({
    selector,
    test: (value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value)? undefined : message || "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt";
    }
})

Validator.isConfirmed = (selector, getConfirmValue, message) => ({
    selector,
    test: (value) =>{
        return value === getConfirmValue() ? undefined : message || "Passwords are not confirmed"
    }
})