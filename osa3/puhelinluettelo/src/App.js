import { useState, useEffect } from 'react';

import noteService from './services/persons';

const Persons = (props) => {
  return (
    <div>
      {props.namesToShow.map((person) => (
        <div key={person.name}>
          <p>
            {person.name} {person.number}
            <button
              type='submit'
              onClick={() => {
                props.deleteNameById(person.id);
              }}
            >
              delete
            </button>
          </p>
        </div>
      ))}
    </div>
  );
};

const Filter = (props) => {
  return (
    <div>
      <form>
        <div>
          filter shown with:{' '}
          <input value={props.filter} onChange={props.handleFilterChange} />
        </div>
      </form>
    </div>
  );
};

const PersonForm = (props) => {
  return (
    <div>
      <form>
        <div>
          name:{' '}
          <input value={props.newName} onChange={props.handleNameChange} />
        </div>
        <div>
          number:{' '}
          <input value={props.newNumber} onChange={props.handleNumberChange} />
        </div>
        <div>
          <button type='submit' onClick={props.addName}>
            add
          </button>
        </div>
      </form>
    </div>
  );
};

const Notification = ({ message, status }) => {
  if (message === null) {
    return null;
  }

  return <div className={status ? 'changed' : 'error'}>{message}</div>;
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState([]);
  const [status, setStatus] = useState(true);

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setPersons(initialNotes);
    });
  }, []);

  const deleteNameById = (id) => {
    const personName = persons.find((person) => person.id === id).name;
    if (window.confirm('Delete ' + personName + ' ?')) {
      noteService
        .deleteName(id)
        .then(() => {
          setStatus(false);
          setPersons(persons.filter((person) => person.id !== id));
          setErrorMessage(`Deleted ${personName}.`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
        })
        .catch((error) => {
          setStatus(false);
          setPersons(persons.filter((person) => person.id !== id));
          setErrorMessage(
            `Information of ${personName} has already been removed from the server.`
          );
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
        });
    } else {
      window.alert(personName + ' was not deleted.');
    }
  };

  const addName = (event) => {
    event.preventDefault();
    const nameObject = {
      name: newName,
      number: newNumber,
    };

    const existingPerson = persons.find((person) => person.name === newName);
    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        noteService
          .update(existingPerson.id, updatedPerson)
          .then((returnedNote) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedNote
              )
            );
            setStatus(true);
            setErrorMessage(`Updated the number for ${newName}.`);
            setTimeout(() => {
              setErrorMessage(null);
            }, 3000);
          });
      } else {
        window.alert(`${newName} was not updated.`);
      }
    } else {
      noteService
        .create(nameObject)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');
          setShowAll(!showAll);
          setStatus(true);
          setErrorMessage(`Added ${nameObject.name}.`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
        })
        .catch((error) => {
          setStatus(false);
          console.log(error.response.data.error);
          setErrorMessage(error.response.data.error);
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
        });
    }
  };

  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    console.log(event.target.value);
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    console.log(event.target.value);
    setFilter(event.target.value);
  };

  const namesToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={errorMessage} status={status} />

      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>

      <PersonForm
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
        addName={addName}
      />

      <h3>Numbers</h3>

      <Persons namesToShow={namesToShow} deleteNameById={deleteNameById} />
    </div>
  );
};

export default App;
