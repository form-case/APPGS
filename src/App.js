import React, { useEffect, useState } from 'react';

const App = () => {
  const [data, setData] = useState([]); // Estado para almacenar los datos de la hoja
  const [selectedPerson, setSelectedPerson] = useState(null); // Persona seleccionada
  const [isNewRecord, setIsNewRecord] = useState(false); // Indica si se está creando un nuevo registro

  // URL de la función de Firebase
  const functionUrl = 'https://updategooglesheet-twmzk5phsa-uc.a.run.app';

  // Función para cargar los datos de Google Sheets desde Firebase Function
  useEffect(() => {
    fetch(`${functionUrl}/get`)
      .then((response) => response.json())
      .then((data) => {
        const [headers, ...rows] = data;
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
  }, [functionUrl]);

  // Función para manejar los cambios en los inputs de detalles del caso
  const handleInputChange = (field, value) => {
    if (selectedPerson) {
      setSelectedPerson({ ...selectedPerson, [field]: value });
    }
  };

  // Función para guardar cambios en Google Sheets
  const handleSaveChanges = async () => {
    try {
      const updatedData = isNewRecord
        ? [...data, selectedPerson]
        : data.map((row) =>
            row.CODE === selectedPerson.CODE ? selectedPerson : row
          );

      const response = await fetch(`${functionUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: updatedData.map((row) => Object.values(row)),
        }),
      });

      if (response.ok) {
        alert('Cambios guardados en Google Sheets');
        setData(updatedData);
        setIsNewRecord(false); // Deja de ser un nuevo registro una vez que se guarda
      } else {
        alert('Hubo un error al guardar los datos');
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Hubo un error al intentar guardar los datos');
    }
  };

  // Función para iniciar un nuevo registro
  const handleNewRecord = () => {
    const newRecord = {};
    Object.keys(data[0] || {}).forEach((key) => {
      newRecord[key] = '';
    });
    setSelectedPerson(newRecord);
    setIsNewRecord(true);
  };

  // Renderizar la galería de casos y los detalles
  return (
    <div style={{ display: 'flex' }}>
      {/* Galería de Casos */}
      <div
        style={{
          width: '30%',
          padding: '10px',
          borderRight: '1px solid #ccc',
        }}
      >
        <h2>Casos</h2>
        <button onClick={handleNewRecord} style={{ marginBottom: '10px' }}>
          Nuevo Registro
        </button>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {data.map((person, index) => (
            <li
              key={index}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor:
                  selectedPerson?.CODE === person.CODE ? '#f0f0f0' : 'transparent',
              }}
              onClick={() => {
                setSelectedPerson(person);
                setIsNewRecord(false);
              }}
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
            <div style={{ marginBottom: '20px' }}>
              <button onClick={handleSaveChanges}>Guardar Cambios</button>
            </div>
            <h2>
              {isNewRecord ? 'Nuevo Registro' : `Detalles del Caso: ${selectedPerson.CODE}`}
            </h2>
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
          </>
        ) : (
          <p>Selecciona un caso para ver los detalles o crea un nuevo registro.</p>
        )}
      </div>
    </div>
  );
};

export default App;
