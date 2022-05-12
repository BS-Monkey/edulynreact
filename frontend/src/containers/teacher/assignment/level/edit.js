import React, {useState, useEffect} from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  IconButton,
  Backdrop,
  CircularProgress,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {Edit} from '@material-ui/icons'
import ImageUploader from 'react-images-upload';
import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'
import {NotificationManager} from 'react-notifications'

import FileUpload from '../../../../components/fileUpload'
import MultiFileUpload from '../../../../components/multiFileUpload'
import {useAsync} from '../../../../service/utils'
import {upload} from '../../../../api/file'
import {update} from '../../../../api/level'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    textTransform: 'none',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))
const EditDialog = (props) => {
  const {data, status, error, run} = useAsync({
    status: 'idle',
  })
  const {level, refresh} = props
  const classes = useStyles();
  const [modalActive, setModalActive] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [otherFiles, setOtherFiles] = useState([])
  const [resDescription, setResDescription] = useState('')
  const [resImage, setResImage] = useState(null)
  const [resVideo, setResVideo] = useState(null)
  const [resOtherFiles, setResOtherFiles] = useState([])
  const [pending, setPending] = useState(false)

  const handleClickOpen = () => {
    setImage(null)
    setVideo(null)
    setOtherFiles([])
    setResImage(null)
    setResVideo(null)
    setResOtherFiles([])
    setName(level.name);
    setTitle(level.title);
    setDescription(level.description);
    setResDescription(level.resDescription);
    setModalActive(true)
  }
  const handleClose = () => {
    setModalActive(false)
  }
  const validate = () => {
    let res = true
    if (title === '')
      res = false
    if (description === '')
      res = false
    if (resDescription === '')
      res = false
    if (!res)
      NotificationManager.warning('Please input required fields', 'Worning', 3000);
    return res
  }
  const handleSave = async () => {
    if (!validate())
      return
    
    let files = []
    let tmp = {}
    tmp._id = level._id
    if (image !== null) {
      let result = await upload(image)
      tmp.image = result.url
    }
    if (video !== null) {
      let result = await upload(video);
      tmp.video = result.url;
    }
    if (resImage !== null) {
      let result = await upload(resImage);
      tmp.resImage = result.url;
    }
    if (resVideo !== null) {
      let result = await upload(resVideo);
      tmp.resVideo = result.url;
    }
    if (otherFiles.length !== 0) {
      let tmpOtherFiles = await Promise.all(otherFiles.map( async (item) => {
        let result = await upload(item)
        return {
          name: item.name,
          url: result.url,
        }
      }))
      tmp.files = tmpOtherFiles;
    }
    if (resOtherFiles.length !== 0) {
      let tmpResOtherFiles = await Promise.all(resOtherFiles.map( async (item) => {
        let result = await upload(item)
        return {
          name: item.name,
          url: result.url,
        }
      }))
      tmp.resFiles = tmpResOtherFiles;
    }
    tmp.title = title
    tmp.description = description
    tmp.resDescription = resDescription
    run(update(tmp))
    setPending(true)
  }
  const onDrop = (file, select) => {
    if (select === 'real')
      setImage(file[0])
    else if (select === 'res')
      setResImage(file[0])
  }
  const changeFile = (file, select) => {
    if (select === 'real')
      setVideo(file)
    else if (select === 'res')
      setResVideo(file)
  }

  useEffect(() => {
    if (status === 'resolved') {
      setPending(false)
      refresh()
      setModalActive(false)
    }
    else if (status === 'rejected') {
      console.log(error)
      setPending(false)
    }
  }, [run, status])
  return (
    <>
      <IconButton aria-label="delete" onClick={handleClickOpen}>
        <Edit />
      </IconButton>
      <Backdrop className={classes.backdrop} open={pending} style={{zIndex: 9999}}>
        <CircularProgress color="primary" />
      </Backdrop>
      <Dialog 
        disableBackdropClick
        disableEscapeKeyDown
        open={modalActive} 
        onClose={handleClose} 
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle id="form-dialog-title">Update Level {name}</DialogTitle>
        <DialogContent>
        <DialogContentText>
            Page data
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            inputProps={{min: 0, style: { fontSize: 20, paddingTop: 10, paddingBottom: 10 }}}
            type="text"
            fullWidth
            variant="outlined"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{marginTop: 20, marginBottom: 20}}
          />
          <SunEditor
            showToolbar={true}
            defaultValue={description}
            onChange={setDescription}
            setDefaultStyle="height: auto"
            setOptions={{
              buttonList: [
                [
                  "bold",
                  "underline",
                  "italic",
                  "strike",
                  "list",
                  "align",
                  "fontSize",
                  "formatBlock",
                  "table",
                  "image"
                ]
              ]
            }}
          />
          <FileUpload label={'Choose Video'} changeFile={(file) => changeFile(file, 'real')} />
          <ImageUploader
            withIcon={false}
            withPreview={true}
            singleImage={true}
            buttonText='Choose images'
            onChange={(file) => onDrop(file, 'real')}
            imgExtension={['.jpg', '.gif', '.png', '.gif']}
            maxFileSize={5242880}
          />
          <MultiFileUpload label={'Upload Other Files'} changeFiles={(files) => setOtherFiles(files)} />
          <DialogContentText>
            Restrict Page data
          </DialogContentText>
          <SunEditor
            showToolbar={true}
            defaultValue={resDescription}
            onChange={setResDescription}
            setDefaultStyle="height: auto"
            setOptions={{
              buttonList: [
                [
                  "bold",
                  "underline",
                  "italic",
                  "strike",
                  "list",
                  "align",
                  "fontSize",
                  "formatBlock",
                  "table",
                  "image"
                ]
              ]
            }}
          />
          <FileUpload label={'Choose Video'} changeFile={(file) => changeFile(file, 'res')} />
          <ImageUploader
            withIcon={false}
            withPreview={true}
            singleImage={true}
            buttonText='Choose images'
            onChange={(file) => onDrop(file, 'res')}
            imgExtension={['.jpg', '.gif', '.png', '.gif']}
            maxFileSize={5242880}
          />
          <MultiFileUpload label={'Upload Other Files'} changeFiles={(files) => setResOtherFiles(files)} />
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button className={classes.button} onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default EditDialog
