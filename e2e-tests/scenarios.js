'use strict';

var fs = require('fs');

function saveScreenshot(data, filename) {
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
}

describe('slider testing', function() {
    
    browser.ignoreSynchronization = true;
    browser.get('');

    it('should render drum element', function() {

        expect(element(by.css('.drum-wrapper')).isPresent()).toBeTruthy();

    }) 


    
    it('should set selected class', function() {

        var number4 = element.all(by.css('figure')).get(4);        
        var container = element(by.css('.drum-container'));

        
        browser.takeScreenshot().then(function(img) {
            saveScreenshot(img, './e2e-tests/pageLoad.png')
        })

        browser.actions()    
            .mouseMove(number4)
            .mouseDown(number4)
            .perform();

        browser.takeScreenshot().then(function(img) {
            saveScreenshot(img, './e2e-tests/mouseMoveToNo4.png')
        })

        browser.sleep(2000);

        browser.actions()
        .mouseUp(container)
        .perform();

        browser.takeScreenshot().then(function(img) {
            saveScreenshot(img, './e2e-tests/mouseUpToContainer.png')
        })
            
        browser.sleep(2000);
        

        expect(element(by.css('.drum')).getCssValue('top')).toEqual('-102px');

        expect(number4.getAttribute('class')).toMatch('selected');
    })
/*    
    browser.sleep(5000); 

    browser.actions()
        .mouseMove(drumWrapper) 
        .mouseDown(drumWrapper) 
        .mouseMove({x:0, y:200})
        .mouseUp()
        .perform();

    

    browser.sleep(5000); */


});
