import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';



const timelineDataUrl = `${process.env.URL}/timelines/${process.env.UUID}/timeline.json`
const renderOptionDataUrl = `${process.env.URL}/timelines/${process.env.UUID}/renderOption.json`

let settings = { method: "Get" };
let jsonOptions, jsonElements;

fetch(renderOptionDataUrl, settings)
    .then(res => res.json())
    .then((json) => {
      console.log(json)
      jsonOptions = json
}).then(() => {
  fetch(timelineDataUrl, settings)
  .then(res => res.json())
  .then((json) => {
    jsonElements = json
}).then(() => {
  console.log(jsonOptions, jsonElements)

  render()
})
})







let dir = "/"
let elementCounts = {
  video: 1,
  audio: 0
}

function render() {
  console.log(process.env.URL)
    let options = jsonOptions
    let elements = jsonElements

    elementCounts.video = 1
    elementCounts.audio = 0
  
    let resizeRatio = options.previewRatio
    let mediaFileLists = ['image', 'video']
    let textFileLists = ['text']
    let audioFileLists = ['audio']
  
    let filter = []
    let command = ffmpeg()
    console.log("dddd", options, options.videoDuration)
    command.input('./media/background.png').loop(options.videoDuration)
  
    filter.push({
      "filter": "scale",
      "options": {
        "w": 1920,
        "h": 1080
      },
      "inputs": `[0:v]`,
      "outputs": `tmp`
    })
  
  
    for (const key in elements) {
      if (Object.hasOwnProperty.call(elements, key)) {
        const element = elements[key];
        //console.log(element)
  
        let isMedia = mediaFileLists.indexOf(element.filetype) >= 0;
        let isText = textFileLists.indexOf(element.filetype) >= 0;
        let isAudio = audioFileLists.indexOf(element.filetype) >= 0;
  
        if(isMedia)  {
          addFilterMedia({
            element: element,
            command: command,
            filter: filter,
            projectOptions: options
          })
        } else if (isText) {
          addFilterText({
            element: element,
            command: command,
            filter: filter,
            projectOptions: options
          })
        } else if (isAudio) {
          addFilterAudio({
            element: element,
            command: command,
            filter: filter,
            projectOptions: options
          })
        }
  
  
      }
    }
  
    let filterLists = ['tmp']
  
    if (elementCounts.audio != 0) {
      filterLists.push('audio')
    }
  
    command.complexFilter(filter, filterLists)
    command.outputOptions(["-map tmp?"])
    if (elementCounts.audio != 0) {
      command.outputOptions(["-map audio?"])
    }
    command.output('./export/result.mp4')
    command.audioCodec('aac')
    command.videoCodec('libx264')
    command.fps(50)
    command.format('mp4');
  
  
  
    //command.audioCodec('libmp3lame')
  
    command.on('progress', function(progress) {
      console.log('Processing: ' + progress.timemark + ' done');
      //evt.sender.send('PROCESSING', progress.timemark)
    })
      
      
  
  
    command.on('end', function() {
      //.sender.send('PROCESSING_FINISH')
        console.log('Finished processing');
    })
    command.run();
    
}


/**
 * @param {{element: object, filter, command, projectOptions}} object description
 */
function addFilterMedia(object) {
    let staticFiletype = ['image']
    let dynamicFiletype = ['video']
    let checkStaticCondition = staticFiletype.indexOf(object.element.filetype) >= 0
    let checkDynamicCondition = dynamicFiletype.indexOf(object.element.filetype) >= 0
  
    object.command.input(`${object.element.localpath}`)
    
  
    let options = {
      width: String(object.element.width * object.projectOptions.previewRatio),
      height: String(object.element.height * object.projectOptions.previewRatio),
      x: String(object.element.location.x * object.projectOptions.previewRatio),
      y: String(object.element.location.y * object.projectOptions.previewRatio),
      startTime: object.element.startTime/200,
      endTime: (object.element.startTime/200) + (object.element.duration/200)
    }
  
    if (checkDynamicCondition) {
      options.startTime = options.startTime + (object.element.trim.startTime/200)
    }
  
  
    object.filter.push({
      "filter": "scale",
      "options": {
        "w": options.width,
        "h": options.height
      },
      "inputs": `[${elementCounts.video}:v]`,
      "outputs": `image${elementCounts.video}`
    })
  
    object.filter.push({
      "filter": "overlay",
      "options": {
        "enable": `between(t,${options.startTime},${options.endTime})`,
        "x": options.x,
        "y": options.y
      },
      "inputs": `[tmp][image${elementCounts.video}]`,
      "outputs": `tmp`
    })
  
    elementCounts.video += 1
}
  
  
/**
 * @param {{element: object, filter, command, projectOptions}} object description
 */
function addFilterText(object) {
  
    let options = {
      text: object.element.text,
      textcolor: object.element.textcolor,
      fontsize: object.element.fontsize * object.projectOptions.previewRatio,
      x: String(object.element.location.x * object.projectOptions.previewRatio),
      y: String(object.element.location.y * object.projectOptions.previewRatio),
      startTime: object.element.startTime/200,
      endTime: (object.element.startTime/200) + (object.element.duration/200)
    }
  
  
    object.filter.push({
      "filter": "drawtext",
      "options": {
        "enable": `between(t,${options.startTime},${options.endTime})`,
        "fontfile": './media/fonts/notosanskr-medium.otf',
        "text": options.text,
        "fontsize": options.fontsize,
        "fontcolor": options.textcolor,
        "x": options.x,
        "y": options.y
      },
      "inputs": `tmp`,
      "outputs": `tmp`
    })
}
  
  
function addFilterAudio(object) {
    let options = {
      startTime: object.element.startTime/200 + (object.element.trim.startTime/200),
      trim: {
        start: object.element.trim.startTime/200
      },
      duration: object.element.trim.endTime/200 - (object.element.trim.startTime/200),
      endTime: (object.element.startTime/200) + (object.element.duration/200)
    }
  
    object.command.input(`${object.element.localpath}`)
      .audioCodec('copy')
      .audioChannels(2)
      .inputOptions(`-itsoffset ${options.startTime}`)
      .seekInput(options.trim.start)
      .inputOptions(`-t ${options.duration}`)
    console.log(object.element.localpath, elementCounts.video)
  
  
    object.filter.push({
      "filter": "amix",
      "options": {
  
        "inputs": elementCounts.audio == 0 ? 1 : 2,
        "duration": "first",
        "dropout_transition": 0
      },
      "inputs": elementCounts.audio == 0 ? `[${elementCounts.video}:a]` : `[audio][${elementCounts.video}:a]`,
      "outputs": `audio`
    })
    
  
    elementCounts.audio += 1
    elementCounts.video += 1
  
}
  
