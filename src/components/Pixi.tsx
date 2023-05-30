/* eslint-disable */

import React, { useEffect, useRef, useState } from 'react'
import { Stage, Sprite, Container, Text, useApp } from '@pixi/react'
import * as PIXI from 'pixi.js'
import useWindowSize from '../hooks/useWindowSize'
import Pin from './../images/pin.svg'
import BackGroundImg from './../images/sample.jpg'
interface Props {
  pins: {
    xRatio: number
    yRatio: number
  }[]
  addPin: (position: { xRatio: number; yRatio: number }) => void
  clickPinHandler: (index: number) => void
}

const numberStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fill: ['#ffffff'],
  fontWeight: 'bold',
})

const MouseFollow = () => {
  const spriteRef = useRef(null)
  const app = useApp()

  useEffect(() => {
    const sprite = spriteRef.current

    const updatePosition = (event: any) => {
      const newPosition = event.data.global
      // @ts-ignore: Object is possibly 'null'
      sprite.position.x = newPosition.x
      // @ts-ignore: Object is possibly 'null'
      sprite.position.y = newPosition.y
    }

    app.renderer.plugins.interaction.on('pointermove', updatePosition)

    return () => {
      app.renderer.plugins.interaction.off('pointermove', updatePosition)
    }
  }, [app.renderer.plugins.interaction])

  return (
    <Sprite
      ref={spriteRef}
      image="./images/mouse.png"
      anchor={0.5}
      x={app.renderer.width / 2}
      y={app.renderer.height / 2}
    />
  )
}
const Pixi = (props: Props) => {
  const [scale, setScale] = useState(0)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const windowSize = useWindowSize()

  const canvasWidth = (windowSize.width - 300) / window.devicePixelRatio || 1
  const canvasHeight = windowSize.height / window.devicePixelRatio || 1
  const anchor = 0.5

  const wheelHandler = (e: WheelEvent) => {
    e.preventDefault()
    if (!Number.isInteger(e.deltaY)) {
      setScale((currentState) =>
        Math.min(Math.max(0.05, currentState + e.deltaY * -0.001), 1)
      )
      return
    }
    setPosition((currentState) => ({
      x: currentState.x - e.deltaX,
      y: currentState.y - e.deltaY,
    }))
  }

  useEffect(() => {
    const el = document.getElementsByTagName('canvas')[0]
    el.onwheel = (e) => {
      wheelHandler(e)
    }
    return () => {
      el.onwheel = null
    }
  }, [])

  const [originalImageSize, setOriginalImageSize] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const img = new Image()

    img.src = BackGroundImg

    img.onload = function () {
      console.log('here')

      const _this = this as unknown as { width: number; height: number }
      setOriginalImageSize({ x: _this.width, y: _this.height })
    }
  }, [])

  useEffect(() => {
    if (originalImageSize.x === 0) {
      return
    }
    if (originalImageSize.x >= originalImageSize.y) {
      setScale(canvasWidth / originalImageSize.x)
      return
    }
    setScale(canvasHeight / originalImageSize.y)
  }, [originalImageSize])

  return (
    <Stage width={canvasWidth} height={canvasHeight} id="canvas">
      <Container>
        <Sprite
          image={BackGroundImg}
          anchor={anchor}
          x={position.x + canvasWidth * anchor}
          y={position.y + canvasHeight * anchor}
          scale={scale}
          eventMode="dynamic"
          pointerdown={(e: any) => {
            const imageSize = {
              x: originalImageSize.x * scale,
              y: originalImageSize.y * scale,
            }
            const xRatio =
              (e.data.global.x -
                ((canvasWidth - imageSize.x) / 2 + position.x)) /
              imageSize.x
            const yRatio =
              (e.data.global.y -
                ((canvasHeight - imageSize.y) / 2 + position.y)) /
              imageSize.y
            props.addPin({
              xRatio,
              yRatio,
            })
          }}
        />
        {props.pins.map((p, i) => {
          const positionX =
            originalImageSize.x * scale * p.xRatio +
            (canvasWidth - originalImageSize.x * scale) / 2 +
            position.x
          const positionY =
            originalImageSize.y * scale * p.yRatio +
            (canvasHeight - originalImageSize.y * scale) / 2 +
            position.y
          return (
            <React.Fragment key={`${p.xRatio} ${p.yRatio}`}>
              <Sprite
                image={Pin}
                anchor={anchor}
                x={positionX}
                y={positionY - 10}
                scale={0.23}
                click={() => props.clickPinHandler(i)}
                eventMode="dynamic"
                cursor="pointer"
              />
              <Text
                text={String(i + 1)}
                x={i < 9 ? positionX - 2 : positionX - 5}
                y={positionY - 18}
                scale={0.3}
                style={numberStyle}
              />
            </React.Fragment>
          )
        })}
        {/* <MouseFollow /> */}
      </Container>
    </Stage>
  )
}

export { Pixi }
