import Input from '@components/Input';
import { useContent } from '@providers/ContentProvider';
import { useQuery } from '@tanstack/react-query';
import Search from '@utils/api/search';
import { imageUrl } from '@utils/formater';
import { FolderSearchIcon, SearchIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './add.module.scss';

export default function AddQueueComponent() {
    const { access_token, closeAddQueue } = useContent();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [current, setCurrent] = useState<MangaEntity | null>(null);
    const [path, setPath] = useState('');
    const { data } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: async () => {
            const mangas = await Search(debouncedSearch, access_token || '');
            return mangas || [];
        },
        enabled: !!debouncedSearch,
    });

    const handleFolderSelect = useCallback(async () => {
        if (window.electron) {
            const path = await window.electron.selectFolder();
            if (path) setPath(path);
            else toast.info('Nenhuma pasta foi selecionada!');
        } else toast.error('Ehh... Cadê a api do electron?');
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 2000);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className={styles.Component}>
            <div className={styles.Container}>
                <div className={styles.Header}>
                    <h1 className={styles.Title}>Adicionar obra</h1>
                    <button className={styles.Close} onClick={closeAddQueue}>
                        <XIcon />
                    </button>
                </div>
                <div className={styles.Content}>
                    <Input
                        className={styles.Input}
                        onChange={setSearch}
                        autoComplete='ym-search'
                        icon={<SearchIcon />}
                        maxLength={30}
                        placeholder='Digite o título da obra'
                        style='line'
                    />
                    <ul className={styles.List}>
                        {(current ? [current] : data ?? []).map(manga => (
                            <li
                                key={manga.id}
                                className={styles.Item}
                                onClick={current ? () => setCurrent(null) : () => setCurrent(manga)}
                                data-active={current?.id === manga.id}
                            >
                                <img
                                    className={styles.Cover}
                                    src={imageUrl(manga.cover || 's3://mangas/cover.avif')}
                                    alt='Cover'
                                />
                                <div className={styles.Manga}>
                                    <h2 className={styles.Title}>ID: {manga.id}</h2>
                                    <h2 className={styles.Title}>{manga.title}</h2>
                                    <span className={styles.Status}>{manga.status}</span>
                                    <span className={styles.Type}>{manga.type}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.Content}>
                    <button
                        className={styles.Button}
                        disabled={!current}
                        onClick={handleFolderSelect}
                    >
                        <FolderSearchIcon />
                        Selecionar pasta
                    </button>
                    <Input
                        className={styles.Input}
                        autoComplete='ym-path'
                        icon={<FolderSearchIcon />}
                        style='bordered'
                        disabled={true}
                        value={path || 'Nenhuma pasta selecionada'}
                        color={path ? '#00ff9d' : !current ? '#ff4f4f' : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
