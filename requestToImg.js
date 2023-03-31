const { REQUEST_HEADERS } = require('./config.json')
const { SlashCommandBuilder } = require('discord.js');
const { Client } = require('undici');

const fs = require('fs')
const { createCanvas } = require('canvas')
const height = 880 + 80
const width = 1200 + 240
const dates = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"]

function getPreferences(userID) {
    const preferences = JSON.parse(fs.readFileSync("SchuelerConfigs.json", "utf8"))

    let inFile = -1;
    for (const schueler in preferences) {
        if (preferences[schueler].id == userID) {
            inFile = schueler;
        }
    }

    if (inFile == -1) {
        interaction.editReply("Bitte setze zuerst deine Kurse!")
        return null;
    }
    return preferences[inFile].kurse;
}

async function getPlan(plan) {
    return new Promise((resolve, reject) => {
        const stundClient = new Client("https://api.schueler.schule-infoportal.de")
        sTime = Date.now()
        stundClient.request({
            path: "/clagybam/api/" + (plan == "s"? "stundenplan" : "vertretungsplan"),
            method: "GET",
            headers: {
                cookie: "schuelerportal_session=eyJpdiI6Iitpb1NnL3I5bVNneTd0N3c4aGtubmc9PSIsInZhbHVlIjoibGZ3YSsxM21YVHU5THM3b1hCNUpIUEs0MFRXV1I4RWpDdG1ZVXdEQ0EzUExhcHJnOSsrMDhHNHZLNFFSVTJPOXpMeVZMUmI5ZHI2UG1CWWxTWlVwTXl5Y1dnZTVRakR1SlRVYkRmekpPYS9uczRienRwZFpubWFsMEhBSTdtSHIiLCJtYWMiOiJiZjI1Zjk5NzQyOTMyNGEyZGYzODJmY2VmOWM3OTU0MGZkMTQ2MjUwMDUwNzI0NzViZGE3M2I1Y2ZiN2U1NGNiIiwidGFnIjoiIn0%3D",
                origin: "https://schueler.schule-infoportal.de"
            }
        }, async function (err, data) {
            if (err) {
                return null
            }
            const {
                statusCode,
                headers,
                trailers,
                body
            } = data

            resolve(await data.body.json());
        });
    })
}

function jsonToImg(allowedUFs, stundJson, vertretJson) {
    var stundPlan = {name: "Stundenplan"}
    for (const x in stundJson.data) {
        stun = stundJson.data[x]

        let allowedUF = false;
        for (const i in allowedUFs) {
            if (stun.uf == allowedUFs[i]) {
                allowedUF = true;
            }
        }

        if (allowedUF) {
            if (!stundPlan[stun.day]) {
                stundPlan[(stun.day)] = {}
            }
            stundPlan[stun.day][stun.hour-1] = x
        }
    }

    var vertretPlan = {name: "Vertretungsplan"}
    for (const x in vertretJson.data) {
        vertret = vertretJson.data[x]

        let allowedUF = false;
        for (const i in allowedUFs) {
            if (vertret.uf == allowedUFs[i]) {
                allowedUF = true;
            }
        }
        
        const day = new Date(vertret.date).getDay() -1

        if (allowedUF) {
            if (!vertretPlan[day]) {
                vertretPlan[(day)] = {}
            }
            vertretPlan[day][vertret.hour-1] = x
        }
    }

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)

    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#3574d4'
    context.font = '18pt Menlo'


    context.fillStyle = '#333';
    context.fillRect(0, 0, 240, 80)
        
    context.font = '18pt Menlo';
    context.fillStyle = '#3574d4';
    
    context.fillText("Stundenplan",
                120,
                30);
    
    /*
    context.beginPath()
    context.lineWidth = 3;
    context.rect(0, 0, 240, 80)
    context.strokeStyle = '#b3b3b3'
    context.stroke()
    context.closePath()
    */
        

    for (let i = 0; i < 5; i++) {
        
        context.fillStyle = '#333';
        context.fillRect((i+1) * 240, 0, 240, 80)
        
        
        context.font = '18pt Menlo';
        context.fillStyle = '#3574d4';
        
        context.fillText(dates[i],
                    (i+1) * 240 + 120,
                    30);
        
        /*
        context.beginPath()
        context.lineWidth = 3;
        context.rect((i+1) * 240, 0, 240, 80)
        context.strokeStyle = '#b3b3b3'
        context.stroke()
        context.closePath()
        */        
                
        
        for (let j = 0; j < 11; j++) {
            
            if (i == 0) {       
                context.fillStyle = '#333';
                context.fillRect(0, (j+1) * 80, 240, 80);
                           
                context.font = '18pt Menlo';
                context.fillStyle = '#3574d4';
                context.fillText(stundJson.zeittafel[j].value,
                                120,
                                (j+1) * 80 + 30);
                
                /*
                context.beginPath()
                context.lineWidth = 3;
                context.rect(0, (j+1) * 80, 240, 80)
                context.strokeStyle = '#b3b3b3'
                context.stroke()
                context.closePath()
                */
                }

            context.beginPath()
            context.lineWidth = 3;
            context.rect((i+1) * 240, (j+1) * 80, 240, 80)
            context.strokeStyle = '#b3b3b3'
            context.stroke()
            context.closePath()
            
            context.textAlign = 'center'
            context.textBaseline = 'top'
            context.fillStyle = '#3574d4'
            context.font = '18pt Menlo'

            if (vertretPlan[i] != undefined && vertretPlan[i][j] != undefined)
            {
                context.fillStyle = '#420000'
                context.fillRect((i+1) * 240, (j+1) * 80, 240, 80)
                context.fillStyle = '#3574d4'

                const vertret = vertretJson.data[vertretPlan[i][j]]

                let vertr_teacher = vertret.reason;
                if (vertret.vertr_teacher != "") {
                    vertr_teacher = vertret.vertr_teacher
                }
                
                context.font = '14pt Menlo'


                const dif1 = ((240 - (context.measureText(vertret.uf).width          + context.measureText(vertret.vertr_uf).width)) / 3);

                context.fillText(vertret.uf,
                                (i+1) * 240 + dif1 + context.measureText(vertret.uf).width / 2,
                                (j+1) * 80);
                context.fillText(vertret.vertr_uf,
                                (i+1) * 240 + 240 - dif1 - context.measureText(vertret.vertr_uf).width / 2,
                                (j+1) * 80);
                context.fillRect((i+1) * 240 + dif1,
                                (j+1) * 80 + 12,
                                context.measureText(vertret.uf).width,
                                2);

                context.fillText(vertret.room,
                                (i+1) * 240 + 120,
                                (j+1) * 80 + 20 * 1);
                                

                context.font = '12pt Menlo'

                
                context.fillText(vertret.abs_teacher,
                                (i+1) * 240 +120,
                                (j+1) * 80 + 16 * 2 + 8);
                context.fillText(vertr_teacher,
                                (i+1) * 240 +120,
                                (j+1) * 80 + 16 * 3 + 8);
                context.fillRect((i+1) * 240 + 120 - context.measureText(vertret.abs_teacher).width/2,
                    (j+1) * 80 + 16 * 2 + 9 + 8,
                    context.measureText(vertret.abs_teacher).width,
                    2);
            

                continue;
            }
            

            if (stundPlan[i] != undefined && stundPlan[i][j] != undefined) {
                context.fillStyle = '#222'
                context.fillRect((i+1) * 240, (j+1) * 80, 240, 80)
                context.fillStyle = '#3574d4'

                const stun = stundJson.data[stundPlan[i][j]]
                
                context.fillText(stun.uf, (i+1) * 240 + 120, (j+1) * 80)
                context.fillText(stun.room, (i+1) * 240 + 120, (j+1) * 80 + 24 * 1)
                continue;
            }

            context.fillStyle = '#444'
            context.fillRect((i+1) * 240, (j+1) * 80, 240, 80)
        }
    }
    
    currentDate = new Date().getDay() -1;
    
    context.beginPath()
    context.lineWidth = 3;
    context.rect((currentDate+1) * 240, 80, 240, 880+80)
    context.strokeStyle = '#600080'
    context.stroke()
    context.closePath()

    const buffer = canvas.toBuffer('image/png')

    return buffer;
}

module.exports = { getPreferences, getPlan, jsonToImg }
