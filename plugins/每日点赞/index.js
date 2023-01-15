const {  KiviPlugin, segment } = require('@kivibot/core')

const { version } = require('./package.json')
const plugin = new KiviPlugin('每日点赞', version)

const config = {  cmd: '赞我' };

plugin.onMounted(bot => {
  plugin.saveConfig(Object.assign(config, plugin.loadConfig()));
  
  //** 修改点赞命令(仅管理员可用) **/
  plugin.onAdminCmd('/like', (e, params) => {
    const cmd = params[0]

    if (!cmd) {
      e.reply('/like <点赞指令>', true)
    } else {
      config.cmd = cmd
      plugin.saveConfig(config)
      e.reply('指令修改成功，重载生效', true)
    }
  })

  //** 手动点赞 **/
  plugin.onMatch(config.cmd, async e => {
    const isFriend = !!bot.fl.get(e.sender.user_id)

    if (isFriend) {
      const friend = bot.pickFriend(e.sender.user_id)

      let n = 0

      while (true) {
        const isOK = await friend.thumbUp(20)

        if (isOK) {
          n += 20
        } else {
          break
        }
      }

      const msg = n > 0 ? `点了 ${n} 下，爱回不回` : '今天点过了，明天赶早'

      e.reply([msg, segment.face(231)], true)
    } else {
      e.reply(['不加好友不点', segment.face(231)], true)
    }
  })

  //** 自动点赞 **/
  let time_='0 '+String(Math.floor(Math.random()* 60))+' 6 * * *';
  plugin.logger.info('[*]自动点赞的时间为' + time_)
  plugin.cron(time_, async () => {
    // 点赞名单, 为空则全部点赞
    let id = [];
    // 黑名单id, 在这里的qq号每日点赞时会忽略
    let blacklist_id = [];
    // 间隔时间
    let delayed = 5000+Math.floor(Math.random() * 10000);
    // bot.fl: Map<number, FriendInfo>
    let alllist= bot.fl
  // 点赞名单
	idlist=[];
	for (let key of alllist){
		idlist.push(key[0])
		// console.log(idlist+'\n')
    // console.log(key);
		}
    //判断白名单模式还是全局模式
    if(id.length ==  0){
        plugin.logger.info(`判断id列表为空，已开启全局模式，即将点赞${idlist[0]}等${idlist.length}名好友`)
    }else{
        let idlist = id;
        plugin.logger.info(`判断id列表不为空，已开启白名单模式，即将点赞${idlist[0]}等${idlist.length}名好友`)
    }
    for (let i = 0; i < idlist.length; i++) {
        setTimeout(() => {
        console.log(`本次为第${i}次点赞，`,idlist[i], `正在点赞中...`)
        if(!blacklist_id.includes(idlist[i])){
            //判断是否在黑名单中
            bot.pickFriend(idlist[i]).thumbUp(20);
            plugin.logger.info(`点赞成功`);
            }
        }, delayed*i);//设置延时
    }
    await bot.pickFriend(plugin.mainAdmin).sendMsg(`主人，今日点赞任务已全部完成，共点赞${idlist.length}人~`)
  })

})


module.exports = { plugin }