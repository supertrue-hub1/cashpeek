import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Заполнение базы данных МФО...')

  // Создаем МФО
  const mfos = await Promise.all([
    db.mFO.create({
      data: {
        name: 'ЗаймДо зарплаты',
        description: 'Быстрые займы до зарплаты с минимальными требованиями',
        rating: 4.5,
        license: 'ЦБ РФ №123',
        website: 'https://zaymdo.ru',
        approvalRate: 0.85,
        loans: {
          create: [
            {
              name: 'До зарплаты',
              minAmount: 1000,
              maxAmount: 30000,
              minTerm: 5,
              maxTerm: 30,
              dailyRate: 0.8,
              firstLoanFree: true,
              processingTime: 5,
              requirements: 'Паспорт РФ, возраст от 18 лет',
              documents: 'Паспорт',
              link: 'https://zaymdo.ru/apply',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'БыстроДеньги',
        description: 'Моментальные займы на карту за 1 минуту',
        rating: 4.3,
        license: 'ЦБ РФ №456',
        website: 'https://bystrodengi.ru',
        approvalRate: 0.82,
        loans: {
          create: [
            {
              name: 'Экспресс',
              minAmount: 2000,
              maxAmount: 50000,
              minTerm: 7,
              maxTerm: 30,
              dailyRate: 0.9,
              firstLoanFree: false,
              processingTime: 1,
              requirements: 'Паспорт РФ, карта любого банка',
              documents: 'Паспорт, СНИЛС',
              link: 'https://bystrodengi.ru/apply',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'МигКредит',
        description: 'Надежные займы с высокими шансами одобрения',
        rating: 4.7,
        license: 'ЦБ РФ №789',
        website: 'https://migcredit.ru',
        approvalRate: 0.88,
        loans: {
          create: [
            {
              name: 'Стандарт',
              minAmount: 3000,
              maxAmount: 100000,
              minTerm: 3,
              maxTerm: 60,
              dailyRate: 0.5,
              firstLoanFree: true,
              processingTime: 15,
              requirements: 'Паспорт РФ, постоянная регистрация',
              documents: 'Паспорт',
              link: 'https://migcredit.ru/apply',
            },
            {
              name: 'Пенсионный',
              minAmount: 1000,
              maxAmount: 30000,
              minTerm: 5,
              maxTerm: 30,
              dailyRate: 0.4,
              firstLoanFree: true,
              processingTime: 10,
              requirements: 'Пенсионное удостоверение, паспорт',
              documents: 'Паспорт, СНИЛС',
              link: 'https://migcredit.ru/pension',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'Екапуста',
        description: 'Займы онлайн на карту круглосуточно',
        rating: 4.4,
        license: 'ЦБ РФ №321',
        website: 'https://ekapusta.ru',
        approvalRate: 0.80,
        loans: {
          create: [
            {
              name: 'Онлайн',
              minAmount: 100,
              maxAmount: 30000,
              minTerm: 7,
              maxTerm: 21,
              dailyRate: 1.0,
              firstLoanFree: true,
              processingTime: 5,
              requirements: 'Паспорт РФ, карта',
              documents: 'Паспорт',
              link: 'https://ekapusta.ru/apply',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'Webbankir',
        description: 'Умные займы с индивидуальным подходом',
        rating: 4.6,
        license: 'ЦБ РФ №555',
        website: 'https://webbankir.com',
        approvalRate: 0.86,
        loans: {
          create: [
            {
              name: 'Базовый',
              minAmount: 3000,
              maxAmount: 50000,
              minTerm: 5,
              maxTerm: 31,
              dailyRate: 0.7,
              firstLoanFree: true,
              processingTime: 10,
              requirements: 'Паспорт РФ, карта, телефон',
              documents: 'Паспорт',
              link: 'https://webbankir.com/apply',
            },
            {
              name: 'Постоянным клиентам',
              minAmount: 5000,
              maxAmount: 70000,
              minTerm: 10,
              maxTerm: 45,
              dailyRate: 0.5,
              firstLoanFree: false,
              processingTime: 3,
              requirements: 'Погашенный займ в Webbankir',
              documents: 'Паспорт',
              link: 'https://webbankir.com/repeat',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'Деньги Сразу',
        description: 'Займы в офисах и онлайн по всей России',
        rating: 4.2,
        license: 'ЦБ РФ №777',
        website: 'https://dengisrazu.ru',
        approvalRate: 0.78,
        loans: {
          create: [
            {
              name: 'Деньги на карту',
              minAmount: 1000,
              maxAmount: 25000,
              minTerm: 1,
              maxTerm: 16,
              dailyRate: 1.1,
              firstLoanFree: false,
              processingTime: 20,
              requirements: 'Паспорт РФ, карта',
              documents: 'Паспорт, ИНН',
              link: 'https://dengisrazu.ru/apply',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'MoneyMan',
        description: 'Займы для студентов и молодежи',
        rating: 4.1,
        license: 'ЦБ РФ №888',
        website: 'https://moneyman.ru',
        approvalRate: 0.75,
        loans: {
          create: [
            {
              name: 'Студенческий',
              minAmount: 1500,
              maxAmount: 20000,
              minTerm: 5,
              maxTerm: 25,
              dailyRate: 0.9,
              firstLoanFree: true,
              processingTime: 10,
              requirements: 'Паспорт, студенческий билет',
              documents: 'Паспорт',
              link: 'https://moneyman.ru/student',
            },
          ],
        },
      },
    }),
    db.mFO.create({
      data: {
        name: 'Займер',
        description: 'Робот-займы с мгновенным решением',
        rating: 4.5,
        license: 'ЦБ РФ №999',
        website: 'https://zaimer.ru',
        approvalRate: 0.83,
        loans: {
          create: [
            {
              name: 'Робот-скоринг',
              minAmount: 2000,
              maxAmount: 30000,
              minTerm: 7,
              maxTerm: 30,
              dailyRate: 0.85,
              firstLoanFree: true,
              processingTime: 2,
              requirements: 'Паспорт РФ, карта',
              documents: 'Паспорт',
              link: 'https://zaimer.ru/apply',
            },
          ],
        },
      },
    }),
  ])

  console.log(`✅ Создано ${mfos.length} МФО с займами`)

  // Показываем статистику
  const loansCount = await db.loan.count()
  console.log(`📊 Всего займов в базе: ${loansCount}`)
}

main()
  .then(() => {
    console.log('🎉 База данных успешно заполнена!')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
