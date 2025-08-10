import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_PATH || 'apps/api/.env' });

import { AppDataSource } from '../database/data-source';
import { Customer } from '../entities/customer.entity';
import { PackageEntity } from '../entities/package.entity';
import { Subscription } from '../entities/subscription.entity';
import { Invoice, InvoiceItem } from '../entities/invoice.entity';

function cents(v: number){ return Math.round(v * 100); }

async function main(){
  await AppDataSource.initialize();
  const custRepo = AppDataSource.getRepository(Customer);
  const packRepo = AppDataSource.getRepository(PackageEntity);
  const subRepo  = AppDataSource.getRepository(Subscription);
  const invRepo  = AppDataSource.getRepository(Invoice);
  const itemRepo = AppDataSource.getRepository(InvoiceItem);

  const customers: Partial<Customer>[] = [
    { legal_name: 'Fauno', email: 'contato@fauno.com', status:'active' },
    { legal_name: 'New Garden', email: 'financeiro@newgarden.com', status:'active' },
    { legal_name: 'SOS Kustom', email: 'contato@soskustom.com', status:'active' },
    { legal_name: 'ADV Diniz', email: 'financeiro@advdiniz.com', status:'active' },
    { legal_name: 'Michelli Frigo', email: 'contato@michellifrigo.com', status:'active' },
    { legal_name: 'Condomínio Fazenda Poços de Caldas', email: 'adm@fazendapocos.com', status:'active' },
    { legal_name: 'Tallent Focus', email: 'finance@tallentfocus.com', status:'active' },
  ];
  const savedCustomers = await custRepo.save(customers);
  const mapC = Object.fromEntries(savedCustomers.map(c=>[c.legal_name, c.id]));

  const pkts: Partial<PackageEntity>[] = [
    { category:'Branding', tier:'PRO',   base_price_cents: cents(6990),  promo_price_cents: cents(5595), periodicity:'one_off' },
    { category:'Branding', tier:'MAX',   base_price_cents: cents(8830),  promo_price_cents: cents(6890), periodicity:'one_off' },
    { category:'Branding', tier:'ULTRA', base_price_cents: cents(11230), promo_price_cents: cents(8990), periodicity:'one_off' },
    { category:'Tráfego Pago', tier:'PRO',   base_price_cents: cents(990),  promo_price_cents: cents(990), periodicity:'monthly', config:{ setup_cents: cents(890), percent_on_ads:false, percent_rate_bp:0 } },
    { category:'Tráfego Pago', tier:'MAX',   base_price_cents: cents(1090), promo_price_cents: cents(1090), periodicity:'monthly', config:{ setup_cents: cents(990), percent_on_ads:true, percent_rate_bp:1500 } },
    { category:'Tráfego Pago', tier:'ULTRA', base_price_cents: cents(1590), promo_price_cents: cents(1590), periodicity:'monthly', config:{ setup_cents: cents(1090), percent_on_ads:true, percent_rate_bp:1000 } },
    { category:'Redes Sociais', tier:'PRO',   base_price_cents: cents(2590), promo_price_cents: cents(2590), periodicity:'monthly', config:{ setup_cents: cents(1990) } },
    { category:'Redes Sociais', tier:'MAX',   base_price_cents: cents(4890), promo_price_cents: cents(3890), periodicity:'monthly' },
    { category:'Redes Sociais', tier:'ULTRA', base_price_cents: cents(9890), promo_price_cents: cents(5890), periodicity:'monthly' },
    { category:'Hospedagem — Cupcode.HOST: WordPress', tier:'ANUAL', base_price_cents: cents(890), promo_price_cents: cents(890), periodicity:'annual' },
    { category:'Hospedagem — Cupcode.HOST: E-commerce', tier:'ANUAL', base_price_cents: cents(890), promo_price_cents: cents(890), periodicity:'annual' },
    { category:'Manutenção de Site — E-commerce — WordPress', tier:'MENSAL', base_price_cents: cents(590), promo_price_cents: cents(590), periodicity:'monthly' },
    { category:'Manutenção de E-commerce — Tray', tier:'MENSAL', base_price_cents: cents(0), promo_price_cents: cents(0), periodicity:'monthly' },
    { category:'Tráfego Pago', tier:'PRO (R$790)', base_price_cents: cents(790), promo_price_cents: cents(790), periodicity:'monthly' },
    { category:'Redes Sociais — PRO (R$2.290)', tier:'MENSAL', base_price_cents: cents(2290), promo_price_cents: cents(2290), periodicity:'monthly' },
    { category:'Registro de Domínio — .com', tier:'ANUAL', base_price_cents: Math.round(189*100/5.9), promo_price_cents: Math.round(15*100/5.9), periodicity:'annual', config:{ currency:'EUR' } }
  ];
  const savedPkgs = await packRepo.save(pkts);
  const findPkg = (category: string, tier: string) => savedPkgs.find(p => p.category === category && p.tier === tier)!;

  const today = new Date();
  const year = today.getUTCFullYear();
  const m = today.getUTCMonth()+1;
  const next5 = (d=5) => {
    const dt = new Date(Date.UTC(year, m-1, d, 3, 0, 0));
    if (today.getUTCDate() > d) dt.setUTCMonth(dt.getUTCMonth()+1);
    return dt.toISOString().slice(0,10);
  };

  const faunoId = mapC['Fauno'];
  await subRepo.save([
    { customer_id: faunoId, package_id: findPkg('Redes Sociais','PRO').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
    { customer_id: faunoId, package_id: findPkg('Tráfego Pago','PRO').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
  ]);

  const ngId = mapC['New Garden'];
  await subRepo.save([
    { customer_id: ngId, package_id: findPkg('Manutenção de E-commerce — Tray','MENSAL').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
    { customer_id: ngId, package_id: findPkg('Redes Sociais — PRO (R$2.290)','MENSAL').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
    { customer_id: ngId, package_id: findPkg('Tráfego Pago','PRO (R$790)').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
  ]);

  const sosId = mapC['SOS Kustom'];
  await subRepo.save([
    { customer_id: sosId, package_id: findPkg('Tráfego Pago','PRO (R$790)').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
    { customer_id: sosId, package_id: findPkg('Manutenção de Site — E-commerce — WordPress','MENSAL').id, charge_day:5, next_due_date: next5(5), status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
  ]);

  const advId = mapC['ADV Diniz'];
  await subRepo.save({
    customer_id: advId,
    package_id: findPkg('Hospedagem — Cupcode.HOST: WordPress','ANUAL').id,
    charge_day: 12,
    next_due_date: `${year}-06-12`,
    status: 'active',
    use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false
  });

  const micId = mapC['Michelli Frigo'];
  await subRepo.save({
    customer_id: micId,
    package_id: findPkg('Hospedagem — Cupcode.HOST: WordPress','ANUAL').id,
    charge_day: 18,
    next_due_date: `${year}-04-18`,
    status: 'active',
    use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false
  });

  const condId = mapC['Condomínio Fazenda Poços de Caldas'];
  const pkgCond = await packRepo.save({ category:'Hospedagem — WP (Condomínio)', tier:'MENSAL', base_price_cents:cents(39), promo_price_cents:cents(39), periodicity:'monthly', config:{ reajusteDepoisDeMeses:6, novoPrecoCents:cents(46) } });
  await subRepo.save({
    customer_id: condId,
    package_id: pkgCond.id,
    charge_day: 5,
    next_due_date: next5(5),
    status: 'active',
    use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false
  });

  const tallId = mapC['Tallent Focus'];
  await subRepo.save([
    { customer_id: tallId, package_id: findPkg('Hospedagem — Cupcode.HOST: E-commerce','ANUAL').id, charge_day:20, next_due_date:`${year}-02-20`, status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
    { customer_id: tallId, package_id: findPkg('Registro de Domínio — .com','ANUAL').id, charge_day:20, next_due_date:`${year}-02-20`, status:'active',
      use_percentage_interest:true, interest_value_or_pct_bp:200, use_percentage_late_fee:true, late_fee_value_or_pct_bp:200, early_discount_enabled:false },
  ]);

  // Uma fatura de exemplo para aparecer no front
  const faunoInvoice = await invRepo.save({
    customer_id: faunoId,
    due_date: next5(5),
    amount_cents: findPkg('Redes Sociais','PRO').promo_price_cents + findPkg('Tráfego Pago','PRO').promo_price_cents,
    status: 'open',
    terms: {
      use_percentage_interest: true, interest_value_or_pct_bp: 200,
      use_percentage_late_fee: true, late_fee_value_or_pct_bp: 200,
      early_discount_enabled: false
    }
  });
  await itemRepo.save([
    { invoice_id: faunoInvoice.id, description: 'Redes Sociais — PRO — Mensal', amount_cents: findPkg('Redes Sociais','PRO').promo_price_cents },
    { invoice_id: faunoInvoice.id, description: 'Tráfego Pago — PRO — Mensal',  amount_cents: findPkg('Tráfego Pago','PRO').promo_price_cents },
  ]);

  console.log('Seeds OK.');
  await AppDataSource.destroy();
}

main().catch(e=>{ console.error(e); process.exit(1); });
