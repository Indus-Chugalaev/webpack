import Post from './Post'
import './css/style.css'
import './css/less.less'
import './css/scss.scss'
import './babel.js'
import React from 'react'
import { render } from 'react-dom'


const post = new Post('Webpack Post Title')

const App = () => (
    <div>
        <h1>Webpack</h1>
        <img src="./favicon.ico"/>
        <div><h2>less</h2></div>
    </div>
)

render(<App />, document.getElementById('app'))

console.log('Post to String:', post.toString())
