# coding: utf-8
import webiopi
import RPi.GPIO as GPIO
import time
import threading
import sys


STEP_R  = 6
DIR_R   = 13
STEP_L  = 0
DIR_L   = 5
SV_CAM  = 10
SV_POW  = 22
SV_CUTA = 11
SV_CUTB = 9

#ピンセットアップ
GPIO.setmode(GPIO.BCM)
GPIO.setup(STEP_R, GPIO.OUT)
GPIO.setup(DIR_R, GPIO.OUT)
GPIO.setup(STEP_L, GPIO.OUT)
GPIO.setup(DIR_L, GPIO.OUT)
GPIO.setup(SV_CAM, GPIO.OUT)
GPIO.setup(SV_POW, GPIO.OUT)
GPIO.setup(SV_CUTA, GPIO.OUT)
GPIO.setup(SV_CUTB, GPIO.OUT)

#グローバル変数セットアップ
start = False
stop = False
writing = False
speed = 40
r_dir = True
l_dir = True

limit＿time = 180
run_wild_count = 0

#ステッピングモーター制御用スレッド--------------------------------------------
def bool2HL(boolean):
    if boolean:
        return GPIO.HIGH
    else:
        return GPIO.LOW

def step_move():
    dt = 0
    run = False
    max_sp, min_sp = 100, 1
    max_dt, min_dt = 0.001, 0.01
    while True:
        if not writing:
            run = (not stop) and start
            r_dir_lw = bool2HL(not r_dir)  
            l_dir_lw = bool2HL(l_dir)
            dt = (speed-min_sp) / (max_sp-min_sp) * (max_dt-min_dt) + min_dt 
        if run:
            GPIO.output(DIR_R, r_dir_lw)
            GPIO.output(DIR_L, l_dir_lw)
            
            GPIO.output(STEP_R, GPIO.HIGH)
            GPIO.output(STEP_L, GPIO.HIGH)
            time.sleep(dt)
            GPIO.output(STEP_R, GPIO.LOW)
            GPIO.output(STEP_L, GPIO.LOW)
            time.sleep(dt)

t = threading.Thread(target = step_move)
t.start()
#-----------------------------------------------------------------------

#サーボモーターの動作周り---------------------------------------------------
#サーボセットアップ
sv_cam = GPIO.PWM(SV_CAM, 50)
sv_pow = GPIO.PWM(SV_POW, 50)
sv_cutA = GPIO.PWM(SV_CUTA, 50)
sv_cutB = GPIO.PWM(SV_CUTB, 50)

#角度の指定
def servoAngle(servo, angle, sleep):
    duty = 3.5 + (11-3.5) * (angle+90) / 180
    servo.ChangeDutyCycle(duty)
    time.sleep(sleep)

#Servo = GPIO.PWM(SV_PIN, 50)
#Servo.start(0)
sv_cutA.start(0)
sv_cutB.start(0)
servoAngle(sv_cutA, 0, 0)
servoAngle(sv_cutB, 0, 1)
sv_cutA.stop(0)
sv_cutB.stop(0)
    
#-----------------------------------------------------------------------

#jsから呼び出すマクロ関数---------------------------------------------------
#起動シーケンス
top, bot = -50, 100
cam = [-70, -50, -25, 0, 25, 100]
on, mid, off = -20, -50, -80
@webiopi.macro
def start():
    #内部電源へ切り替え
    sv_pow.start(0)
    servoAngle(sv_pow, on, 1)
    servoAngle(sv_pow, mid, 1)
    sv_pow.stop(0)
    #ケーブルの離脱
    sv_cutA.start(0)
    sv_cutB.start(0)
    servoAngle(sv_cutA, -40, 0)
    servoAngle(sv_cutB, -40, 1)
    servoAngle(sv_cutA, 0, 0)
    servoAngle(sv_cutB, 0, 1)
    sv_cutA.stop(0)
    sv_cutB.stop(0)
    #カメラ直立
    sv_cam.start(0)
    servoAngle(sv_cam, cam[1], 1)
    time.sleep(1)
    global start
    start = True
    
#終了シーケンス
@webiopi.macro
def end():
    #カメラ収納
    servoAngle(sv_cam, cam[-1], 1)
    #電源遮断
    sv_pow.start(0)
    servoAngle(sv_pow, off, 1)
    servoAngle(sv_pow, mid, 1)
    sv_pow.stop(0)

#前進　
@webiopi.macro
def forward():
    global writing, stop, r_dir, l_dir
    writing = True
    stop = False
    r_dir = True
    l_dir = True
    writing = False

#後退
@webiopi.macro
def backward():
    global writing, stop, r_dir, l_dir
    writing = True
    stop = False
    r_dir = False
    l_dir = False
    writing = False

#左旋回
@webiopi.macro
def left():
    global writing, stop, r_dir, l_dir
    writing = True
    stop = False
    r_dir = True
    l_dir = False
    writing = False
    
#右旋回
@webiopi.macro
def right():
    global writing, stop, r_dir, l_dir
    writing = True
    stop = False
    r_dir = False
    l_dir = True
    writing = False

#停止
@webiopi.macro
def stop():
    global writing, stop, r_dir, l_dir
    writing = True
    stop = True
    writing = False
    
#速度変更
@webiopi.macro
def setSpeed(sp):
    global speed
    speed = int(sp)

#カメラ角度変更
@webiopi.macro
def setCamera(camID):
    servoAngle(sv_cam, cam[int(camID)], 0.01)
    
