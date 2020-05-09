import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-text-list',
  templateUrl: './text-list.component.html',
  styleUrls: ['./text-list.component.scss']
})
export class TextListComponent implements OnInit {

  charactersPerLine;
  maxLines;
  textOutput = '';
  onPaste = false;
  widthPerCharacter = 10; // approximation: how much pixels of width does each character need.

  constructor() {
  }

  ngOnInit() {
    this.charactersPerLine = document.getElementById('charactersPerLine')['value'];
    this.maxLines = document.getElementById('maxLines')['value'];
  }

  formatTextAsRequired() {
    /*
    This function handles two aspects:
    1. (a) READ VALUE from the textarea, (b) DETECT IF TEXT PER LINE IS TOO LONG  as required by the length restrictions,
    (c) PUSH OVERFLOWING TEXT from a line to the next line and (d) WRITE VALUE back to the textarea.
    2. (a) READ THE CURSOR POSITION to store the cursor position, and (b) POSITION THE CURSOR where a user would expect it after WRITE DATA.
    */
    const textInput = document.getElementById('flexibleInputField')['value']; // 1a: READ VALUE
    const inputAsRows = textInput.split('\n'); // create array from input => each element contains one row of the textarea
    const inputAsOneLine = textInput.replace(/(\r\n\t|\n|\r\t)/gm, ''); // remove all line-breaks
    const cursorPositionOnInput = document.getElementById('flexibleInputField')['selectionStart']; // 2a: READ CURSOR POSITION
    // set default value for cursor offset. cursor offset is needed when re-posiotioning the cursor after WRITE DATA
    let cursorOffsetAfterOutput = 0;

    // number of visible characters per line before text breaks without a line-break.
    // Depends on width of textarea and width of characters entered.
    const visibleCharactersPerLine = Math.floor((document.getElementById('flexibleInputField').offsetWidth) / 9);
    let additionalTextAreaRows = 0; // additional rows needed due to the text breaking

    // don't put inputAsRows.length in the for statement, as the array is growing in the loop which results in an infinite loop
    let totalRows = inputAsRows.length;
    let row;
    let lineBreakCount = 0;
    let characterCount = 0;
    for (row = 0; row < totalRows; ++row) {
      if (inputAsRows[row].length > this.charactersPerLine) { // 1b DETECT IF TEXT PER LINE IS TOO LONG
        if (inputAsRows[row + 1] === undefined) {
          inputAsRows[row + 1] = ''; // the row did not exist
          totalRows++;
        }
        // 1c PUSH OVERFLOWING TEXT: move text that is too long for this row to the next row:
        inputAsRows[row + 1] = inputAsRows[row].substring(this.charactersPerLine) + inputAsRows[row + 1];
        inputAsRows[row] = inputAsRows[row].substring(0, this.charactersPerLine);
        // determine, if cursor was at the end of the line that got a line-break:
        const newOutput = inputAsRows.join('\n');
        if (newOutput.substr(cursorPositionOnInput - 1, 1) === '\n') {
          cursorOffsetAfterOutput = 1;
        }
      }
      if (inputAsRows[row].length > visibleCharactersPerLine) { // 1b DETECT IF TEXT PER LINE IS TOO LONG
        additionalTextAreaRows = additionalTextAreaRows + Math.floor(inputAsRows[row].length / visibleCharactersPerLine);
      }

    }

    // data is within max number of rows and max total digits
    if (inputAsRows.length <= this.maxLines && inputAsOneLine.length <= (this.maxLines * this.charactersPerLine)) {
      this.textOutput = inputAsRows.join('\n');
      document.getElementById('flexibleInputField')['rows'] = inputAsRows.length + additionalTextAreaRows; // resize textarea
      document.getElementById('errors').innerHTML = ''; // remove error message
      document.getElementById('count').innerHTML = inputAsOneLine.length + '/'
        + (this.maxLines * this.charactersPerLine); // show digits count
      if (this.onPaste) {
        cursorOffsetAfterOutput = this.cursorOffsetOnPaste(textInput, cursorPositionOnInput, totalRows);
      }
    } else {
      // data would be too long
      document.getElementById('errors').innerHTML = 'This field can only have '
        + this.maxLines + ' lines with ' + this.charactersPerLine + ' characters per line.'; // display error message
      document.getElementById('count').innerHTML = ''; // remove digits count
      cursorOffsetAfterOutput = -1;
    }
    document.getElementById('flexibleInputField')['value'] = this.textOutput; // 1d: WRITE VALUE
    document.getElementById('flexibleInputField')['selectionStart'] =
      cursorPositionOnInput + cursorOffsetAfterOutput; // 2b: POSITION CURSOR
    document.getElementById('flexibleInputField')['selectionEnd'] =
      cursorPositionOnInput + cursorOffsetAfterOutput; // set a single cursor, not a selection
    this.onPaste = false;
    this.showOutput();
    this.toggleLabel();
  }

  countLineBreaks(s, lengthFromStart) {
    const left = s.substr(0, lengthFromStart);
    const countOfLinebreaks = (left.split('\n')).length;
    return countOfLinebreaks;
  }

  handlePaste() {
    // some improvements when pasting content can still be made (particularly on the cursor position)
    this.onPaste = true;
  }

  cursorOffsetOnPaste(textInput, cursorPositionOnInput, totalRows) {
    // offset the cursor by 1 for each added line break:
    const countOld = this.countLineBreaks(textInput, cursorPositionOnInput);
    const countNew = this.countLineBreaks(this.textOutput, cursorPositionOnInput + totalRows);
    const cursorOffsetAfterOutput = countNew - countOld;
    return cursorOffsetAfterOutput;
  }

  updateRestrictions() {
    this.charactersPerLine = document.getElementById('charactersPerLine')['value'];
    this.maxLines = document.getElementById('maxLines')['value'];
  }

  // This reflects how the data would be stored in seperate fields
  showOutput() {
    let outputHTMLtable = '<table>';
    const textInput = document.getElementById('flexibleInputField')['value']; // READ DATA
    const inputAsRows = textInput.split('\n'); // create array from input => each element contains one row of the textarea
    for (let row = 0; row < inputAsRows.length; row++) {
      outputHTMLtable = outputHTMLtable + '<tr><td>field ' + row + ':</td><td>' + inputAsRows[row] + '</td></tr>';
    }
    outputHTMLtable = outputHTMLtable + '</table>';
    document.getElementById('output').innerHTML = outputHTMLtable;
  }

  // Let's add some styling to the input field
  onFocus() {
    const flexibleInputField = document.getElementById('flexibleInputField');
    flexibleInputField.classList.remove('inactive');
    flexibleInputField.classList.add('active');
    const inputLabel = document.getElementById('inputLabel');
    inputLabel.classList.remove('inactive');
    inputLabel.classList.add('active');
  }

  toggleLabel() {
    const flexibleInputField = document.getElementById('flexibleInputField');
    const inputLabel = document.getElementById('inputLabel');
    if (flexibleInputField['value'].length > 0) {
      inputLabel.classList.remove('hidden');
      inputLabel.classList.add('show');
    } else {
      inputLabel.classList.remove('show');
      inputLabel.classList.add('hidden');
    }
  }

  onBlur() {
    const flexibleInputField = document.getElementById('flexibleInputField');
    flexibleInputField.classList.remove('active');
    flexibleInputField.classList.add('inactive');
    const inputLabel = document.getElementById('inputLabel');
    inputLabel.classList.remove('active');
    inputLabel.classList.add('inactive');
    document.getElementById('errors').innerHTML = ''; // remove error message
  }

  evaluatePastedData() {

  }
}
