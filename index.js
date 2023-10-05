const Discord = require('discord.js');
const mysql = require('mysql');
const moment = require('moment');
const client = new Discord.Client();
const config = require('./config.json');

moment.locale("pl");

const conn = mysql.createConnection({
    host     : 'DATABASE HOST',
    port     : '3306',
    user     : 'DATABASE USERNAME',
    password : 'DATABASE PASSWORD',
    database : 'DATABASE NAME',
    charset  : 'utf8mb4'
});

client.once('ready', () => {
    console.log  ('Bot Ready.');
    client.user.setActivity("🛡️ Kushiro IP-LOCK SYSTEM", { type: "WATCHING"});
});

setInterval(function(){
    console.log('🛡️ Kushiro IP-LOCK SYSTEM');

    conn.query("UPDATE users SET `valid` = 'false' WHERE `expire` <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)", function (err, result, fields) {

        if (err) {
            return console.log(err);
        }

    });

}, 120000); // czas w ms

client.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    if (message.channel.type == "dm") return;
    
    const args = message.content.slice(config.prefix.length).split(' ');
    const command = args.shift();


    if (command === 'redeem') {

        message.delete(); // Delete msg

        if (!args.length) {

            const embed = new Discord.RichEmbed()
                .setColor('#e2574c')
                .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                .setDescription('Correct use: !redeem [MY KEY]')

            return message.channel.send(embed);
        }

        conn.query('SELECT * FROM users WHERE license = ?', [args[0]], function (err, result, fields) {

            if (err) {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('The key you entered is not valid.')

                return message.channel.send(embed);
            }

            if (result.length > 0) {

                if (result) {

                    if (result[0].user == "NULL") {

                        conn.query('UPDATE users SET user = ? WHERE license = ?', [message.member.id, args[0]], function (err, result, fields) {

                            if (err) {

                                const embed = new Discord.RichEmbed()
                                    .setColor('#e2574c')
                                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                                    .setDescription('A server-side error has occurred.')
                
                                return message.channel.send(embed);
                            }

                            const embed = new Discord.RichEmbed()
                            .setColor('#00C851')
                            .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                            .setDescription('The given key has been assigned to your account.')
            
                            return message.channel.send(embed);

                        });

                    } else {
                        const embed = new Discord.RichEmbed()
                            .setColor('#e2574c')
                            .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                            .setDescription('This key already has an owner.')

                        return message.channel.send(embed);
                    }
                }

            }

        });
    }

    if (command === 'setip') {

        message.delete(); // Delete msg

        if (!args.length) {

            const embed = new Discord.RichEmbed()
                .setColor('#e2574c')
                .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                .setDescription('Correct use: !setip [YOUR KEY] [YOUR SERVER IP ADRESS]')

            return message.channel.send(embed);
        }

        conn.query('SELECT * FROM users WHERE license = ?', [args[0]], function (err, result, fields) {

            if (err) {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('The key you entered is not valid.')

                return message.channel.send(embed);
            }

            if (args[1] == "localhost" || args[1] == "127.0.0.1") {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription(`You cannot use this server address (${args[1]}).\nYou should use the public address of the FiveM hosting server.`)

                return message.channel.send(embed);

            }

            if (result.length > 0) {

                if (result) {

                    let beforeIp = result[0].server;

                    if (result[0].user == message.member.id || message.member.hasPermission('ADMINISTRATOR')) {

                        conn.query('UPDATE users SET server = ? WHERE license = ?', [args[1], args[0]], function (err, result, fields) {

                            if (err) {

                                const embed = new Discord.RichEmbed()
                                    .setColor('#e2574c')
                                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                                    .setDescription('A server-side error has occurred.')
                
                                return message.channel.send(embed);
                            }

                            const embed = new Discord.RichEmbed()
                                .setColor('#00C851')
                                .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                                .setDescription(`The server address assigned to the key has been successfully changed.\nFrom **${beforeIp}** to **${args[1]}**.`)
            
                            return message.channel.send(embed);

                        });

                    } else {
                        const embed = new Discord.RichEmbed()
                            .setColor('#e2574c')
                            .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                            .setDescription('You are not the owner of this key.')

                        return message.channel.send(embed);
                    }
                }

            }

        });
    }

    if (command === 'info') {

        if (!args.length) {

            const embed = new Discord.RichEmbed()
                .setColor('#e2574c')
                .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                .setDescription('Correct use: !info [YOUR KEY]')

            return message.channel.send(embed);
        }

        conn.query('SELECT * FROM users WHERE license = ?', [args[0]], function (err, result, fields) {

            if (err) {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('The key you entered is not valid.')

                return message.channel.send(embed);
            }

            if (result.length > 0) {

                if (result) {

                    let date;
                    let belongs;
                    let server;

                    if (result[0].valid == "true") {
                        date = moment(result[0].expire).format('LLL');
                    } else {
                        date = "❌ The key has expired.";
                    }

                    if (result[0].user == "NULL") {
                        belongs = "No owner.";
                    } else {
                        belongs = '<@' + result[0].user + '>';
                    }

                    if (result[0].server == "none") {
                        server = "No server assigned.";
                    } else {
                        server = result[0].server;
                    }

                    const embed = new Discord.RichEmbed()
                        .setColor('#00C851')
                        .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                        .setDescription('```Information about the selected key.```')
                        .addField('Key:', result[0].license)
                        .addField('Created by:', '<@' + result[0].creator + '>')
                        .addField('Belongs to:', belongs)
                        .addField('Valid until:', date)
                        .addField('Assigned Server:', server)
                        .setTimestamp()
    
                    return message.channel.send(embed);

                }

            } else {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('The key you entered is not valid.')

                return message.channel.send(embed);

            }

        });
    }

    if (command === 'keys') {

        conn.query('SELECT * FROM users WHERE user = ?', [message.member.id], function (err, result, fields) {

            if (err) {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('An error occurred while retrieving your keys.')

                return message.channel.send(embed);
            }

            if (result.length > 0) {

                if (result) {

                    const embed = new Discord.RichEmbed()
                        .setColor('#00C851')
                        .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                        .setDescription('```List of keys assigned to your account.```');
                        result.forEach(function(row) {
                            embed.addField('Key:', row.license)
                        })
                        embed.setTimestamp()
    
                    return message.channel.send(embed);

                }

            } else {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('You don\'t have any keys on your account.')

                return message.channel.send(embed);

            }

        });
    }

    if (command === 'help') {

        const exampleEmbed = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setAuthor('Commands:', 'https://i.imgur.com/DhNQJUw.png')
            .addField('!delete', 'Removes the key from the database (admin).')
            .addField('!create', 'Creates a new key (admin).')
            .addField('!redeem:', 'Assigns a key to the account.')
            .addField('!keys', 'List of keys assigned to the account.')
        //    .addField('Najlepszy hosting zapewnia:', 'https://lvlup.pro')
        //    .addField('Z kodem', 'ANYFORUM.PL - 10% rabatu')
            .setTimestamp()

        return message.channel.send(exampleEmbed);
    }

    if (command === 'delete') {

        if (message.member.hasPermission('ADMINISTRATOR')) {

            if (!args.length) {

                const exampleEmbed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('Correct use: !delete [KEY]')

                return message.channel.send(exampleEmbed);
            }

            conn.query('SELECT license FROM users WHERE license = ?', [args[0]], function (err, result, fields) {

                if (err) {
                    const embed = new Discord.RichEmbed()
                        .setColor('#e2574c')
                        .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                        .setDescription('The key you entered is not valid.')

                    return message.channel.send(embed);
                }

                if (result.length > 0) {

                    if (result) {

                        conn.query('DELETE FROM users WHERE license = ?', [args[0]], function (err, result, fields) {
                        
                            if (err) {
                                const embed = new Discord.RichEmbed()
                                    .setColor('#e2574c')
                                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                                    .setDescription('An error occurred while performing the operation.')
            
                                return message.channel.send(embed);
                            }

                            const embed = new Discord.RichEmbed()
                            .setColor('#00C851')
                            .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                            .setDescription(`The **${args[0]}** has been removed from the database.`)
            
                            return message.channel.send(embed);

                        });

                    }

                }

            });

        } else {
            const embed = new Discord.RichEmbed()
            .setColor('#e2574c')
            .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
            .setDescription('You do not have the required permissions to use this.')

            return message.channel.send(embed);
        }
    }

    if (command === 'create') {

        if (message.member.hasPermission('ADMINISTRATOR') || message.member.roles.has('739387266857959426')) { // Change the role ID on Discord

            let r = Math.random().toString(36).substr(5, 5) + "-" + Math.random().toString(36).substr(5, 5) + "-" + Math.random().toString(36).substr(5, 5) + "-" + Math.random().toString(36).substr(5, 5);

            if (!args.length) {

                const embed = new Discord.RichEmbed()
                    .setColor('#e2574c')
                    .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                    .setDescription('Correct use: !create [NUMBER] [DAY / MONTH / YEAR]')

                return message.channel.send(embed);
            }

                conn.query(`INSERT INTO users (license, expire, creator) VALUES ('${r}', DATE_ADD(NOW(), INTERVAL ${args[0]} ${args[1]}), ${message.member.id});`, function (err, result, fields) {

                    if (err) {
                        const embed = new Discord.RichEmbed()
                            .setColor('#e2574c')
                            .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
                            .setDescription('An error occurred while performing the operation.')

                        return message.channel.send(embed);
                    }

                    const priv = new Discord.RichEmbed()
                        .setColor('#00C851')
                        .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                        .setDescription(`The **${r}** key was successfully generated.\nThe key is valid for **${args[0]} ${args[1]}**.`)
    
                    message.author.send(priv);
                    message.author.send('To get lua codes visit the help chanel!');
                    
                    const embed = new Discord.RichEmbed()
                        .setColor('#00C851')
                        .setAuthor('Success!', 'https://i.imgur.com/DhNQJUw.png')
                        .setDescription('The key has been successfully generated.\nYou received the message containing the key in a private message.')
    
                    return message.channel.send(embed);

                });

        } else {
            const embed = new Discord.RichEmbed()
            .setColor('#e2574c')
            .setAuthor('Woops!', 'https://i.imgur.com/8bo2OJT.png')
            .setDescription('You do not have the required permissions to use this.')

            return message.channel.send(embed);
        }
    }

});

client.login(config.token);
