// electron/bridge.ts
import { render } from '@testing-library/react'
import { contextBridge, ipcRenderer } from 'electron'
const fs = require('fs')
const path = require('path')
import { Dirent } from 'original-fs'
