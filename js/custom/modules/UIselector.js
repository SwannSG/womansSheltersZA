// NEW
ws.UIdata = [
    {"selectorType": "dropDownList",
     "selectorLabel": "Ward Data",
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
] 


ws.createUI_1 = (uidata, index) => {

    let el = document.createElement('div');
    el.setAttribute('class', "user-select__group-1");
    el.addEventListener('change', (event) => {
        let inputTextId = event.target.options[event.target.selectedIndex].getAttribute('data-input-id');
        let defaultInputTextValue = event.target.options[event.target.selectedIndex].getAttribute('data-legend');
        document.getElementById(inputTextId).value = defaultInputTextValue;
    });


    result = ``;

    for (let [i, each] of uidata.entries()) {
        let dropdown = ws.createDropdown(each, i);
        let legend = ws.createLegendTitle(each, i);
        let selectGroup =   `<div class="user-select__group">
                                ${dropdown}
                            </div>
                            <div class="user-select__group">
                                ${legend}
                            </div>`
        result = result + selectGroup
    }
    el.innerHTML = result;
    return el; 
}

ws.createDropdown = (x, index) => {
    // x UIdata[n] obj, index int
    let dropdownListHtml = ws.createDropdownList(x.dropdownList, index);
    let label =     `<label for="select-${index}" class="user-select__label">${x.selectorLabel}:</label>`;
    let select =    `<select name="data-source" class="user-select__select" id="select-${index}">
                        ${dropdownListHtml}
                    </select`;
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
    console.log('aaa', x.dropdownList.legendTitle);
    let result =    `<div class="user-select__group">
                        <label for="text-${index}" class="user-select__label">Legend title:</label>
                        <input name="title" type="text" class="user-select__input" id="text-${index}">
                    </div>`
    return result;
}



el = ws.createUI_1(ws.UIdata);
document.body.appendChild(el);