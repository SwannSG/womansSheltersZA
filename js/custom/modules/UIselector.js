// UI to select layers

ws.UIdata = [
    {"selectorType": "dropDownList",
     "selectorLabel": "Ward Data for all skaaps",
     "dropdownList": [
        { "resource": {"id": "data/<file_to_get>",
                        "display": "shows in drop down",
                        "legendTitle": "skaap appears in legend"}
        }
     ]},
     {"selectorType": "dropDownList",
     "selectorLabel": "Shelters",
     "dropdownList": [
        { "resource": {"id": "data/<file_to_get>",
                        "display": "Eastern Cape",
                        "legendTitle": "Eastern Cape woman's shelters"}
        }
     ]},
     {"selectorType": "dropDownList",
     "selectorLabel": "Courts",
     "dropdownList": [
        { "resource": {"id": "data/<file_to_get>",
                        "display": "Western Cape",
                        "legendTitle": "Western Cape courts"}
        }
     ]},
] 

let gt;
ws.createUserSelect = (uidata) =>  {
    let el = document.createElement('div');
    el.setAttribute('class', 'user-select');
    el.setAttribute('style', 'display: none;')
    el.addEventListener('change', (event) => {
        let inputTextId = event.target.options[event.target.selectedIndex].getAttribute('data-input-id');
        let defaultInputTextValue = event.target.options[event.target.selectedIndex].getAttribute('data-legend');
        document.getElementById(inputTextId).value = defaultInputTextValue;
    });

    let elements = ws.createUI_1(uidata);
    gt = elements;
    for (let each of elements) {
        el.appendChild(each);
    }
    return el;
}

ws.createUI_1 = (uidata) => {

    let elements = [];
    let result = ``;
    let el;
    for (let [i, each] of uidata.entries()) {
        el = document.createElement('div');
        el.setAttribute('class', "user-select__group-1");
        let dropdown = ws.createDropdown(each, i);
        let legend = ws.createLegendTitle(each, i);
        let selectGroup =   `<div class="user-select__dropdown">
                                ${dropdown}
                            </div>
                            <div class="user-select__legend">
                                ${legend}
                            </div>`
        result = result + selectGroup
        el.innerHTML = result;
        elements.push(el);
        result = ``;
    }
    return elements;
}

ws.createDropdown = (x, index) => {
    // x UIdata[n] obj, index int
    let dropdownListHtml = ws.createDropdownList(x.dropdownList, index);
    let label =     `<label for="select-${index}" class="user-select__label">${x.selectorLabel}:</label>`;
    let select =    `<select name="data-source" class="user-select__select" id="select-${index}">
                        ${dropdownListHtml}
                    </select>`;
     return label + select
}

ws.createDropdownList = (x, index) => {
    // x dropdownList obj
    // add a None option
    x.unshift({resource: {"id": "None", "display": "None", "legendTitle": ""}});
    let result = ``;
    let temp = ``;
    for (let each of x) {
        temp = `<option value="${each.resource.id}" data-legend="${each.resource.legendTitle}" data-input-id="text-${index}">${each.resource.display}</option>`;
        result = result + temp;
    }
    return result;
}

ws.createLegendTitle = (x, index) => {
    // x UIdata[n] obj, index int
    let result =    `<label for="text-${index}" class="user-select__label">Legend title:</label>
                     <input name="title" type="text" class="user-select__input" id="text-${index}">`
    return result;
}



ref = document.getElementsByClassName('main')[0]
document.body.insertBefore(ws.createUserSelect(ws.UIdata), ref);
