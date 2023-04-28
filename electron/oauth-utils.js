const debug = require("debug")("eoh:helper")
const querystring = require("querystring")
const net = require("electron").net

/**
 *
 * @param {string} redirectURL
 * @param {Electron.WebContents} webContents
 */
const awaitRedirect = (redirectURL, webContents) => {

  if (!redirectURL || !webContents) {
    return Promise.reject(new Error("Invalid parameter"))
  }

  /**
   * @param {string} url
   */
  const isRedirectURL = url => {
    return url.startsWith(redirectURL)
  }

  return new Promise(resolve => {

    const testWillNavigate = (event, url) => {
      debug("on will-navigate:", url)
      if (isRedirectURL(url)) {
        off()
        resolve(url)
      }
    }

    const testDidGetRedirectRequest = (event, oldUrl, newUrl) => {
      debug("on did-get-redirect-request:", newUrl)
      if (isRedirectURL(newUrl)) {
        off()
        resolve(newUrl)
      }
    }

    const off = () => {
      webContents.removeListener("will-navigate", testWillNavigate)
      webContents.removeListener("did-get-redirect-request", testDidGetRedirectRequest)
    }

    webContents.on("will-navigate", testWillNavigate)
    webContents.on("did-get-redirect-request", testDidGetRedirectRequest)
  })
}





/**
 * @param {string} url
 * @param {object} parameter - post data
 * @param {object} headers
 * @returns {Promise<{statusCode: number, statusMessage: string, headers: object, body: Buffer}>}
 */
const postRequest = (url, parameter, headers) => {

  return new Promise((resolve, reject) => {

    const postData = querystring.stringify(parameter)

    const request = net.request({
      url,
      method: "POST",
      headers: Object.assign({}, {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData)
      }, headers || {})
    })

    request.on("response", response => {

      const datas = []

      response.on("data", chunk => {
        datas.push(chunk)
      })

      response.on("end", () => {
        const body = Buffer.concat(datas)
        const resp = {
          headers: response.headers,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          body: body,
        }
        resolve(resp)
      })

      response.on("error", error => {
        reject(error)
      })
    })

    request.write(postData, "utf8")
    request.end()
  })
}

/**
 * @param response {object}
 * @param response.headers {object}
 * @param response.statusCode {number}
 * @param response.statusMessage {string}
 *
 * @returns Promise<object>
 */
const convertUsefulObject = response => {

  response.body = response.body.toString("utf8")

  if (response.statusCode >= 400) {

    const error = new Error(`Error response: ${response.statusCode} - ${response.statusMessage}`)
    error.response = response
    return Promise.reject(error)
  }

  if (response.headers["content-type"].join(" ").includes("application/json")) {
    response.body = JSON.parse(response.body)
  }

  return response.body
}

/**
 *
 * @param {object} obj
 * @param {string|[string]} props
 */
const omit = (obj, props) => {

  obj = obj || {}
  props = props || []

  if (typeof props === "string") {
    props = [props]
  }

  return Object.keys(obj).reduce((prev, key) => {
    if (!props.includes(key)) {
      // eslint-disable-next-line
      prev[key] = obj[key]
    }
    return prev
  }, {})
}

/**
 *
 * @param {object} obj
 * @param {string|[string]} props
 */
const pick = (obj, props) => {

  obj = obj || {}
  props = props || []

  if (typeof props === "string") {
    props = [props]
  }

  return Object.keys(obj).reduce((prev, key) => {
    if (props.includes(key)) {
      // eslint-disable-next-line
      prev[key] = obj[key]
    }
    return prev
  }, {})
}


module.exports = {
  omit,
  pick,
  convertUsefulObject,
  postRequest,
  awaitRedirect
}
