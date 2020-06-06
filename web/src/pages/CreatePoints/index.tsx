import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './style.css';

import Logo from '../../assets/logo.svg';
import Dropzone from '../../components/dropzone';

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGECityResponse{
    nome: string
}

interface IBGEUFResponse{
    sigla: string
}

interface FormData{
    name: string,
    email: string,
    whatsapp: string,
}

const CreatePoint = () => {
    const [items, setItems] = React.useState<Item[]>([]);
    const [ufs, setUfs] = React.useState<string[]>([]);
    const [cities, setCities] = React.useState<string[]>(['0']);

    const [initialPosition, setInitialPosition] = React.useState<[number, number]>([0,0]);

    const [ formData, setFormData] = React.useState<FormData>({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [selectedUF, setSelectedUF] = React.useState<string>('0');
    const [selectedCity, setSelectedCity] = React.useState<string>('0');
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = React.useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedFile] = React.useState<File>();

    const history = useHistory();

    React.useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords; 
            setInitialPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        })
    },[])

    React.useEffect(()=>{
        api.get("itens").then(response => {
            console.log(response);
            setItems(response.data)
        })
    }, []);

    React.useEffect(()=>{
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response => {
            const ufInitials = response.data.map(uf => {
                return uf.sigla;
            });

            setUfs(ufInitials);
        })
    },[]);

    React.useEffect(() => {
        //https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios
        if(selectedUF === '0') return;

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => {
            console.log(response);
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        })
    }, [selectedUF])

    function handleSelectUf(event: React.ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUF(uf);
    }

    function handleSelectCity(event: React.ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;

        setFormData( {...formData, [name]: value} )
    }

    function handleSelectClick(id: number){
        const alreadySelected = selectedItems.findIndex(item => item == id);
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item != id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
        
    }

    async function handleSubmit(event: React.FormEvent){
        event.preventDefault();

        if(!selectedFile){
            alert("Selecione a imagem do estabelecimento.");
            return;
        }

        const { name, email, whatsapp } = formData;
        const [ latitude, longitude ] = selectedPosition;
        const uf = selectedUF;
        const city = selectedCity;
        const items = selectedItems;

        const data = new FormData();


        data.append('name', name );
        data.append('email', email );
        data.append('whatsapp', whatsapp );
        data.append('latitude', String(latitude) );
        data.append('longitude', String(longitude) );
        data.append('uf', uf );
        data.append('city', city );
        data.append('itens', items.join(',') );
        data.append('image', selectedFile);


        console.log(data);
        await api.post("points", data);

        alert("Cadastrado com sucesso!");
        
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />

                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                    id="uf" 
                                    value={selectedUF}
                                    onChange={handleSelectUf}>
                                <option value="0">Selecione uma opção...</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                onChange={handleSelectCity}>
                                <option value="0">Selecione uma opção...</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                            key={item.id} 
                            className={selectedItems.includes(item.id) ? 'selected' : ''}
                            onClick={() => handleSelectClick(item.id)}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;