import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]); // Estado para almacenar los datos de la hoja
  const [selectedPerson, setSelectedPerson] = useState(null); // Persona seleccionada

  // ID de la hoja de Google y API key (reemplázalas con las tuyas)
  const sheetID = '1b3wUkfYsC0afHkPNxIP_05kkD005K-IXhzTS3zZnEgo';
  const apiKey = 'AIzaSyBSQIMuFV5BObLIvxX0SVIFkopb-CwR5AA';
  const range = 'HOLD USRAP!A:CY';

  // URL de la API de Google Sheets
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=${apiKey}`;

  // Función para cargar los datos de Google Sheets
  useEffect(() => {
    axios
      .get(url)
      .then((response) => {
        const [headers, ...rows] = response.data.values;
        // Convertir los datos a un formato de objetos con encabezados
        const formattedData = rows.map((row) =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index] || '';
            return acc;
          }, {})
        );
        setData(formattedData);
      })
      .catch((error) => console.error('Error fetching data: ', error));
  }, [url]);

  // Función para manejar los cambios en los inputs de detalles del caso
  const handleInputChange = (field, value) => {
    if (selectedPerson) {
      setSelectedPerson({ ...selectedPerson, [field]: value });
    }
  };

  // Función para guardar cambios en Google Sheets
  const handleSaveChanges = async () => {
    try {
      const updatedData = data.map((row) =>
        row.CODE === selectedPerson.CODE ? selectedPerson : row
      );

      const response = await fetch(
        'https://updategooglesheet-twmzk5phsa-uc.a.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: updatedData.map((row) => Object.values(row)),
          }),
        }
      );

      if (response.ok) {
        alert('Cambios guardados en Google Sheets');
      } else {
        alert('Hubo un error al guardar los datos');
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Hubo un error al intentar guardar los datos');
    }
  };

  // Renderizar la galería de casos y los detalles
  return (
    <div style={{ display: 'flex' }}>
      {/* Galería de Casos */}
      <div style={{ width: '30%', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h2>Casos</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {data.map((person, index) => (
            <li
              key={index}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: selectedPerson?.CODE === person.CODE ? '#f0f0f0' : 'transparent',
              }}
              onClick={() => setSelectedPerson(person)}
            >
              {person.CODE} - {person.NAME}
            </li>
          ))}
        </ul>
      </div>

      {/* Detalles del Caso Seleccionado */}
      <div style={{ width: '70%', padding: '10px' }}>
        {selectedPerson ? (
          <>
            <h2>Detalles del Caso: {selectedPerson.CODE}</h2>
            {Object.keys(selectedPerson).map((key) => (
              <div key={key} style={{ marginBottom: '10px' }}>
                <label style={{ marginRight: '10px' }}>{key}</label>
                <input
                  type="text"
                  value={selectedPerson[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
            <button onClick={handleSaveChanges}>Guardar Cambios</button>
          </>
        ) : (
          <p>Selecciona un caso para ver los detalles</p>
        )}
      </div>
    </div>
  );
};

export default App;
