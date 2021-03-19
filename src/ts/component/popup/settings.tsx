import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon, Button, Title, Label, Cover, Textarea, Loader, IconObject, Error, Pin } from 'ts/component';
import { I, C, Storage, translate, Util, DataUtil } from 'ts/lib';
import { authStore, blockStore, commonStore, popupStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.Popup, RouteComponentProps<any> {};

interface State {
	page: string;
	loading: boolean;
	error: string;
};

const { dialog } = window.require('electron').remote;
const { ipcRenderer } = window.require('electron');
const $ = require('jquery');
const Constant: any = require('json/constant.json');
const sha1 = require('sha1');
const QRCode = require('qrcode.react');

@observer
class PopupSettings extends React.Component<Props, State> {

	phraseRef: any = null;
	state = {
		page: 'index',
		loading: false,
		error: '',
	};
	onConfirmPin: () => void = null;
	onConfirmPhrase: any = null;
	format: string = '';

	constructor (props: any) {
		super(props);

		this.onClose = this.onClose.bind(this);
		this.onPage = this.onPage.bind(this);
		this.onCover = this.onCover.bind(this);
		this.onLogout = this.onLogout.bind(this);
		this.onFocusPhrase = this.onFocusPhrase.bind(this);
		this.onCheckPin = this.onCheckPin.bind(this);
		this.onSelectPin = this.onSelectPin.bind(this);
		this.onTurnOffPin = this.onTurnOffPin.bind(this);
		this.onFileClick = this.onFileClick.bind(this);
	};

	render () {
		const { account } = authStore;
		const { cover, coverImage } = commonStore;
		const { page, loading, error } = this.state;
		const pin = Storage.get('pin');

		let content = null;
		let inputs = [];
		let Item = null;

		let Head = (item: any) => (
			<div className="head">
				<div className="element" onClick={() => { this.onPage(item.id); }}>
					<Icon className="back" />
					{item.name}
				</div>
			</div>
		);

		switch (page) {

			default:
			case 'index':
				content = (
					<div>
						<Title text={translate('popupSettingsTitle')} />

						<div className="rows">
							<div className="row" onClick={() => { this.onPage('wallpaper'); }}>
								<Icon className="wallpaper" />
								<Label text={translate('popupSettingsWallpaperTitle')} />
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('phrase'); }}>
								<Icon className="phrase" />
								<Label text={translate('popupSettingsPhraseTitle')} />
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('pinIndex'); }}>
								<Icon className="pin" />
								<Label text={translate('popupSettingsPinTitle')} />
								<div className="status">
									{pin ? 'On' : 'Off'}
								</div>
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('importIndex'); }}>
								<Icon className="import" />
								<Label text={translate('popupSettingsImportTitle')} />
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('exportMarkdown'); }}>
								<Icon className="export" />
								<Label text={translate('popupSettingsExportTitle')} />
								<Icon className="arrow" />
							</div>
						</div>

						<div className="logout" onClick={this.onLogout}>{translate('popupSettingsLogout')}</div>
					</div>
				);
				break;

			case 'wallpaper':
				let colors = [ 'yellow', 'orange', 'pink', 'red', 'purple', 'navy', 'blue', 'ice', 'teal', 'green' ];
				let covers1 = [  ];
				let covers2 = [];

				for (let i = 1; i <= 11; ++i) {
					covers1.push({ id: 'c' + i, image: '', type: I.CoverType.Image });
				};

				for (let c of colors) {
					covers2.push({ id: c, image: '', type: I.CoverType.Color });
				};

				if (coverImage) {
					covers2.unshift({ id: 0, image: coverImage, type: I.CoverType.Upload });
				};

				Item = (item: any) => (
					<div className={'item ' + (item.active ? 'active': '')} onClick={() => { this.onCover(item); }}>
						<Cover {...item} preview={true} className={item.id} />
					</div>
				);

				content = (
					<div>
						<Head id="index" name={translate('popupSettingsTitle')} />
						<Title text={translate('popupSettingsWallpaperTitle')} />

						<div className="row first">
							<Label text={translate('popupSettingsWallpaperText')} />
							<div className="fileWrap item" onClick={this.onFileClick}>
								<Cover className="upload" type={I.CoverType.Color} id="white" />
							</div>
						</div>

						<div className="row">
						<Label className="name" text={translate('popupSettingsPicture')} />
							<div className="covers">
								{covers1.map((item: any, i: number) => (
									<Item key={i} {...item} active={item.id == cover.id} />
								))}
							</div>
						</div>

						<div className="row last">
							<Label className="name" text={translate('popupSettingsColor')} />
							<div className="covers">
								{covers2.map((item: any, i: number) => (
									<Item key={i} {...item} preview={true} active={item.id == cover.id} />
								))}
							</div>
						</div>
					</div>
				);
				break;

			case 'phrase':
				content = (
					<div>
						<Head id="index" name={translate('popupSettingsTitle')} />
						<Title text={translate('popupSettingsPhraseTitle')} />
						<Label text={translate('popupSettingsPhraseText')} />
						<div className="inputs">
							<Textarea ref={(ref: any) => this.phraseRef = ref} value={authStore.phrase} onFocus={this.onFocusPhrase} placeHolder="witch collapse practice feed shame open despair creek road again ice least lake tree young address brain envelope" readOnly={true} />
						</div>
						<div className="path">
							<br/><b>{translate('popupSettingsMobileQRSubTitle')}</b><br/>
							— Launch Anytype<br/>
							— Press "Login"<br/>
							— "Scan QR code"<br/>
							— Point your phone to this screen<br/>
						</div>
						<div className="qr">
							<QRCode value={authStore.phrase} />
						</div>
						{this.onConfirmPhrase ? (
							<div className="buttons">
								<Button text={translate('popupSettingsPhraseOk')} className="orange" onClick={() => {	this.onConfirmPhrase();	}} />
							</div>
						) : ''}
					</div>
				);
				break;

			case 'pinIndex':
				content = (
					<div>
						<Head id="index" name={translate('popupSettingsTitle')} />
						<Title text={translate('popupSettingsPinTitle')} />
						<Label text={translate('popupSettingsPinText')} />

						{pin ? (
							<div className="buttons">
								<Button text={translate('popupSettingsPinOff')} className="blank" onClick={() => {
									this.onConfirmPin = this.onTurnOffPin;
									this.onPage('pinConfirm');
								}} />
								<Button text={translate('popupSettingsPinChange')} className="blank" onClick={() => {
									this.onConfirmPin = () => { this.onPage('pinSelect'); };
									this.onPage('pinConfirm');
								}} />
							</div>
						): (
							<div className="buttons">
								<Button text={translate('popupSettingsPinOn')} className="blank" onClick={() => {
									this.onPage('pinSelect');
								}} />
							</div>
						)}

					</div>
				);
				break;

			case 'pinSelect':
				content = (
					<div>
						<Head id="pinIndex" name={translate('commonCancel')} />
						<Title text={translate('popupSettingsPinTitle')} />
						<Label text={translate('popupSettingsPinText')} />
						<Pin onSuccess={this.onSelectPin} />
					</div>
				);
				break;

			case 'pinConfirm':
				content = (
					<div>
						<Head id="pinIndex" name={translate('commonCancel')} />
						<Title text={translate('popupSettingsPinTitle')} />
						<Label text={translate('popupSettingsPinVerify')} />
						<Error text={error} />

						<Pin 
							value={Storage.get('pin')} 
							onSuccess={this.onCheckPin} 
							onError={() => { this.setState({ error: translate('popupSettintsSectionPinError') }) }} 
						/>
					</div>
				);
				break;

			case 'importIndex':
				const items = [
					{ id: 'notion', name: 'Notion', disabled: false },
					{ id: 'evernote', name: 'Evernote', disabled: true },
					{ id: 'roam', name: 'Roam Researh', disabled: true },
					{ id: 'word', name: 'Word', disabled: true },
					{ id: 'text', name: 'Text & Markdown', disabled: true },
					{ id: 'html', name: 'HTML', disabled: true },
					{ id: 'csv', name: 'CSV', disabled: true },
				];

				Item = (item: any) => (
					<div className={[ 'item', item.id, (item.disabled ? 'disabled' : '') ].join(' ')} onClick={() => {
						if (!item.disabled) {
							this.onPage(Util.toCamelCase('import-' + item.id));
						};
					}}>
						{item.disabled ? <div className="soon">{translate('commonSoon')}</div> : ''}
						<div className="txt">
							<Icon />
							<div className="name">{item.name}</div>
						</div>
					</div>
				);

				content = (
					<div>
						<Head id="index" name={translate('popupSettingsTitle')} />
						<Title text={translate('popupSettingsImportTitle')} />
						<Label text={translate('popupSettingsImportText')} />
						<div className="items">
							{items.map((item: any, i: number) => (
								<Item key={i} {...item} />
							))}
						</div>
					</div>
				);
				break;

			case 'importNotion':
				content = (
					<div>
						<Head id="importIndex" name={translate('popupSettingsImportTitle')} />

						<Title text={translate('popupSettingsImportHow')} />
						<Label text={translate('popupSettingsImportFirst')} />

						<div className="path">
							<b>{translate('popupSettingsImportGetTitle')}</b><br/>
							<IconObject object={{ iconEmoji: ':gear:' }} /> Settings & Members → <IconObject object={{ iconEmoji: ':house:' }} /> Settings → Export all workspace content → <br/>
							Export format : "Markdown & CSV".
						</div>

						<div className="path">
							<b>{translate('popupSettingsImportPageTitle')}</b><br/>
							Three dots menu on the top-left corner → <IconObject object={{ iconEmoji: ':paperclip:' }} /> Export →  <br/> Export format : "Markdown & CSV".
						</div>

						<Label className="last" text={translate('popupSettingsImportZip')} />
						<Button text={translate('popupSettingsImportOk')} className="orange" onClick={() => { this.onImport('notion'); }} />
					</div>
				);
				break;

			case 'exportMarkdown':
				content = (
					<div>
						<Head id="index" name={translate('popupSettingsTitle')} />

						<Title text={translate('popupSettingsExportMarkdownTitle')} />
						<Label text={translate('popupSettingsExportMarkdownText')} />

						<Button text={translate('popupSettingsExportOk')} className="orange" onClick={() => { this.onExport(I.ExportFormat.Markdown); }} />
					</div>
				);
				break;
		};

		return (
			<div className={'tab ' + Util.toCamelCase('tab-' + page)}>
				{loading ? <Loader /> : ''}
				{content}
			</div>
		);
	};

	componentDidMount () {
		const { param } = this.props;
		const { data } = param;
		const { page } = data || {};

		if (page) {
			this.onPage(page);
		};

		this.init();
	};

	componentDidUpdate () {
		this.init();
	};

	componentWillUnmount () {
		$(window).unbind('resize.settings');
	};

	onFileClick (e: any) {
		const { root } = blockStore;
		const options: any = {
			properties: [ 'openFile' ],
			filters: [ { name: '', extensions: Constant.extension.image } ]
		};

		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};

			this.setState({ loading: true });

			C.UploadFile('', files[0], I.FileType.Image, true, (message: any) => {
				if (message.error.code) {
					return;
				};

				this.setState({ loading: false });
				commonStore.coverSetUploadedImage(message.hash);
				commonStore.coverSet('', message.hash, I.CoverType.Upload);
				DataUtil.pageSetCover(root, I.CoverType.Upload, message.hash);
			});
		});
	};

	onFocusPhrase (e: any) {
		this.phraseRef.select();
	};

	onCheckPin (pin: string) {
		this.onPage('pinSelect');
		if (this.onConfirmPin) {
			this.onConfirmPin();
			this.onConfirmPin = null;
		};
		this.setState({ error: '' });
	};

	onSelectPin (pin: string) {
		Storage.set('pin', sha1(pin));
		this.onPage('index');
	};

	onTurnOffPin () {
		Storage.delete('pin');
		this.onPage('index');
	};

	onClose () {
		this.props.close();
	};

	onPage (id: string) {
		if (id != 'phrase') {
			this.onConfirmPhrase = null;
		};

		this.setState({ page: id });
	};

	onCover (item: any) {
		const { root } = blockStore;

		DataUtil.pageSetCover(root, item.type, item.image || item.id);
		commonStore.coverSet(item.id, item.image, item.type);
	};

	onLogout (e: any) {
		const { history } = this.props;

		this.onConfirmPhrase = () => {
			C.AccountStop(false);
			authStore.logout();
			history.push('/');

			this.onConfirmPhrase = null;
		};
		
		this.onPage('phrase');
	};

	onImport (format: string) {
		const platform = Util.getPlatform();
		const { history } = this.props;
		const { root } = blockStore;
		const options: any = { 
			properties: [ 'openFile' ],
			filters: [
				{ name: '', extensions: [ 'zip' ] }
			]
		};

		if (platform == I.Platform.Mac) {
			options.properties.push('openDirectory');
		};

		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};

			this.setState({ loading: true });
			C.BlockImportMarkdown(root, files[0], () => {
				this.props.close();
				this.setState({ loading: false });
				
				history.push('/main/index');
			});
		});
	};

	onExport (format: I.ExportFormat) {
		const { root } = blockStore;

		let options: any = {};

		switch (format) {
			case I.ExportFormat.Markdown:
				options = { 
					properties: [ 'openDirectory' ],
				};

				dialog.showOpenDialog(options).then((result: any) => {
					const files = result.filePaths;
					if ((files == undefined) || !files.length) {
						return;
					};

					this.setState({ loading: true });

					C.Export(files[0], [], format, true, (message: any) => {	
						this.setState({ loading: false });

						if (message.error.code) {
							popupStore.open('confirm', {
								data: {
									title: 'Ooops!',
									text: 'Something went wrong. <br/>If you think it’s our fault, please write us a feedback.',
									textConfirm: 'Try one more time',
									canCancel: false,
									onConfirm: () => {
									},
								},
							});
							return;
						};

						ipcRenderer.send('pathOpen', files[0]);
						this.props.close();
					});
				});
				break;
		};
	};

	init () {
		this.props.position();
		$(window).unbind('resize.settings').on('resize.settings', () => { this.props.position(); });
	};

};

export default PopupSettings;
