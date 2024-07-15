import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import './NetworkAttacksChart.css';

// Компонент для отображения пользовательского тултипа на графике
const CustomTooltip = (props) => {
  const { active, payload } = props || {}; // Извлекаем active и payload из пропсов

  // Если тултип активен и есть данные, отображаем их
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#8884d8' }}>
        <p>{`${payload[0].payload.time}`}</p> {/* Дата и время атаки */}
        <p style={{ color: '#8884d8' }}>{`Количество атак: ${payload[0].value}`}</p> {/* Количество атак */}
      </div>
    );
  }
  return null; // Если нет активного тултипа, ничего не возвращаем
};

const NetworkAttacksChart = ({ encryptedData }) => {
  const [data, setData] = useState([]); // Состояние для хранения данных графика
  const [dataKey, setDataKey] = useState([0, 0]); // Состояние для хранения ключа данных для Brush
  const [timeRange, setTimeRange] = useState('1d'); // Состояние для выбора временного диапазона
  const [startDate, setStartDate] = useState(''); // Состояние для начальной даты
  const [stopDate, setStopDate] = useState(''); // Состояние для конечной даты

  // Функция для получения данных с сервера
  const fetchData = useCallback(async (start, stop) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/barChart`, {
        data: encryptedData,
        startDate: start,
        stopDate: stop,
      });
  
      if (response.status === 200) {
        const responseData = response.data;
        const formattedData = responseData.date.map((time, index) => ({
          time,
          attacks: responseData.count_attack[index],
        }));
  
        setData(formattedData);
        setDataKey([0, formattedData.length - 1]);
      } else {
        console.error('Error fetching data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [encryptedData]);

  // Функция для обновления дат на основе выбранного временного диапазона
  const updateDates = useCallback(() => {
    const now = new Date(); // Получаем текущее время
    let startOfDay;

    // Определяем начальную дату в зависимости от выбранного диапазона
    switch (timeRange) {
      case '1h':
        startOfDay = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case '6h':
        startOfDay = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '1d':
        startOfDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '3d':
        startOfDay = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startOfDay = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startOfDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const formattedStartDate = toLocalDateString(startOfDay);
    const formattedStopDate = toLocalDateString(now);

    if (timeRange !== 'custom') {
      setStartDate(formattedStartDate);
      setStopDate(formattedStopDate);
      fetchData(formattedStartDate, formattedStopDate);
    }
  }, [timeRange, fetchData]);

  // Функция для форматирования даты в строку
  const toLocalDateString = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
      .toISOString()
      .slice(0, 16);
  };

  // Используем useEffect для обновления дат при изменении зависимостей
  useEffect(() => {
    updateDates();
  }, [updateDates]);

  // Функция для обработки изменения Brush
  const onBrushChange = (e) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      setDataKey([e.startIndex, e.endIndex]);
    }
  };

  // Функция для обработки отправки формы
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData(startDate, stopDate); 
  };

  // Функция для обработки изменения дат
  const handleDateChange = (e, isStartDate) => {
    const value = e.target.value;

    // Устанавливаем начальную или конечную дату
    if (isStartDate) {
      setStartDate(value);
    } else {
      setStopDate(value);
    }

    setTimeRange('custom');
  };

  return (
    <div className="container">
      <h1>Сетевые Атаки</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="interval-group">
          <label>
            Временной интервал:
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="1h">За последний час</option>
              <option value="6h">За последние 6 часов</option>
              <option value="1d">За 1 день</option>
              <option value="3d">За 3 дня</option>
              <option value="7d">За 7 дней</option>
              <option value="custom" disabled>Пользовательский</option>
            </select>
          </label>
        </div>
        <div className="date-group">
          <label>
            Начальная дата:
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => handleDateChange(e, true)}
            />
          </label>
          <label>
            Конечная дата:
            <input
              type="datetime-local"
              value={stopDate}
              min={startDate}
              onChange={(e) => handleDateChange(e, false)}
            />
          </label>
          <button type="submit">Получить данные</button>
        </div>
      </form>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" /> {/* Сетка графика */}
          <XAxis dataKey="time" /> {/* Ось X */}
          <YAxis /> {/* Ось Y */}
          <Tooltip content={<CustomTooltip />} /> {/* Тултип для отображения информации */}
          <Bar dataKey="attacks" fill="#8884d8" /> {/* Столбцы графика */}
          <Brush
            dataKey="time"
            height={30}
            stroke="#8884d8"
            onChange={onBrushChange} // Обработка изменения Brush
            startIndex={dataKey[0]}
            endIndex={dataKey[1]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkAttacksChart;
