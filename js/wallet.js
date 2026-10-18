/* =========================================================
   wallet.js — نظام المحافظ المالية المنفصلة لكل لاعب
               + توزيع كل مصادر الأموال بين المحفظتين
   ========================================================= */
(function(){
'use strict';
const ND=window.ND, S=ND.S, ST=ND.ST;

ND.walFmt  = i => ND.fmt(S.wal[i]);
ND.walTotal= ()  => S.wal[0]+S.wal[1];
ND.walName = i => i? 'زياد' : 'فواز';

/* إضافة مبلغ إلى محفظة لاعب محدد */
ND.gainTo=(i,amt)=>{ if(amt>0&&i>=0&&i<2) S.wal[i]+=amt; };

/* توزيع مبلغ بالتساوي على اللاعبين النشطين (مصادر الدخل المشتركة) */
ND.gain=amt=>{ if(!(amt>0))return; const n=Math.max(1,S.players), e=amt/n;
  for(let i=0;i<n;i++) S.wal[i]+=e; };

/* خصم من لاعب محدد */
ND.spend=(i,amt)=>{ if(S.wal[i]<amt) return false; S.wal[i]-=amt; return true; };

/* الدفع المشترك: يُخصم من أول محفظة تملك المبلغ، ويعيد فهرس الدافع (-1 إذا لم يكفِ) */
ND.pay=amt=>{ for(let i=0;i<S.players;i++) if(S.wal[i]>=amt){S.wal[i]-=amt;return i} return -1 };
ND.canPay=amt=>{ for(let i=0;i<S.players;i++) if(S.wal[i]>=amt) return true; return false };

/* تحويل مبلغ بين المحفظتين */
ND.transfer=(from,to,amt)=>{
  if(from===to) return false;
  amt=Math.min(amt,S.wal[from]); if(!(amt>0)) return false;
  S.wal[from]-=amt; S.wal[to]+=amt; return true; };

/* الدخل التلقائي: إيجار المباني (يُوزَّع) + دخل العقارات (لصاحبها) */
ND.walletTick=dt=>{
  let rent=0;
  for(const b of S.builds) if(ND.BT&&ND.BT[b[0]]) rent+=ND.BT[b[0]].p*0.0005;
  if(rent>0) ND.gain(rent*dt);                 // مدخول المباني بين المحفظتين
  if(ND.propTick) ND.propTick(dt);             // دخل العقارات لمحفظة المالك
  ST.incomeT+=dt;
};
})();
